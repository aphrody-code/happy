import { delay, inject } from 'tsyringe'

import { Service } from '@/decorators'
import { Poll, PollOption, PollVote } from '@/entities'
import { Database } from '@/services'

@Service()
export class PollService {

	constructor(
		@inject(delay(() => Database)) private db: Database
	) {}

	/**
	 * Get a poll by ID
	 */
	async getById(pollId: number, populate: string[] = []): Promise<Poll | null> {
		return this.db.get(Poll).findOne({ id: pollId }, { populate: populate as any })
	}

	/**
	 * Create a new poll
	 */
	async create(guildId: string, creatorId: string, title: string, options: string[], description?: string, allowMultiple: boolean = false, maxVotes: number = 1, duration?: number): Promise<Poll> {
		const poll = new Poll()
		poll.title = title
		poll.description = description
		poll.guildId = guildId
		poll.creatorId = creatorId
		poll.allowMultiple = allowMultiple
		poll.maxVotes = maxVotes

		if (duration) {
			const expiresAt = new Date()
			expiresAt.setMinutes(expiresAt.getMinutes() + duration)
			poll.expiresAt = expiresAt
		}

		for (const optionLabel of options) {
			const option = new PollOption()
			option.label = optionLabel
			option.poll = poll
			poll.options.add(option)
		}

		await this.db.em.persistAndFlush(poll)

		return poll
	}

	/**
	 * Cast a vote for a poll (atomic transaction)
	 */
	async vote(pollId: number, userId: string, optionId: number): Promise<{ success: boolean, type: 'SUCCESS' | 'REMOVED' | 'NOT_FOUND' | 'CLOSED' | 'OPTION_NOT_FOUND' | 'ALREADY_VOTED' | 'MAX_VOTES_REACHED' }> {
		return this.db.em.transactional(async (em) => {
			const poll = await em.findOne(Poll, { id: pollId }, { populate: ['options'] })
			if (!poll)
				return { success: false, type: 'NOT_FOUND' as const }

			// Close expired polls
			if (poll.isActive && poll.expiresAt && poll.expiresAt < new Date())
				poll.isActive = false

			if (!poll.isActive)
				return { success: false, type: 'CLOSED' as const }

			const option = poll.options.getItems().find(o => o.id === optionId)
			if (!option)
				return { success: false, type: 'OPTION_NOT_FOUND' as const }

			if (!poll.allowMultiple) {
				// Single choice: change or same
				const existingVote = await em.findOne(PollVote, { poll: poll.id, userId }, { populate: ['option'] })
				if (existingVote) {
					if (existingVote.option.id === optionId)
						return { success: false, type: 'ALREADY_VOTED' as const }
					existingVote.option = option
				} else {
					const vote = new PollVote()
					vote.poll = poll
					vote.userId = userId
					vote.option = option
					em.persist(vote)
				}
			} else {
				// Multiple choices: toggle or add
				const existingVoteForOption = await em.findOne(PollVote, { poll: poll.id, userId, option: optionId })
				if (existingVoteForOption) {
					em.remove(existingVoteForOption)

					return { success: true, type: 'REMOVED' as const }
				}

				// Check max votes (atomic within transaction — no race condition)
				const userVotesCount = await em.count(PollVote, { poll: poll.id, userId })
				if (userVotesCount >= poll.maxVotes)
					return { success: false, type: 'MAX_VOTES_REACHED' as const }

				const vote = new PollVote()
				vote.poll = poll
				vote.userId = userId
				vote.option = option
				em.persist(vote)
			}

			return { success: true, type: 'SUCCESS' as const }
		})
	}

	/**
	 * Get poll results
	 */
	async getResults(pollId: number): Promise<{ total: number, options: { label: string, count: number, percentage: number, id: number }[] }> {
		const poll = await this.db.get(Poll).findOne({ id: pollId }, { populate: ['options', 'options.votes'] })
		if (!poll)
			throw new Error('Poll not found')

		const totalVotes = await this.db.get(PollVote).count({ poll: poll.id })
		const results = poll.options.getItems().map((option) => {
			const count = option.votes.count()
			const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0

			return {
				id: option.id,
				label: option.label,
				count,
				percentage: Math.round(percentage),
			}
		})

		return {
			total: totalVotes,
			options: results,
		}
	}

	/**
	 * Close a poll
	 */
	async close(pollId: number): Promise<void> {
		const poll = await this.db.get(Poll).findOne({ id: pollId })
		if (poll) {
			poll.isActive = false
			await this.db.em.flush()
		}
	}

}
