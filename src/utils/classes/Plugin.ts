import fs from 'node:fs'
import { sep } from 'node:path'

import { importx, resolve } from '@discordx/importer'
import { AnyEntity, EntityClass } from '@mikro-orm/core'
import semver from 'semver'
import { BaseTranslation } from 'typesafe-i18n'

import { locales } from '@/i18n'
import { BaseController } from '@/utils/classes'
import { getSourceCodeLocation, getTscordVersion } from '@/utils/functions'

// Utiliser require() pour que ts-node intercepte les imports .ts
// (import() dynamique passe par le loader ESM natif de Node.js 22+ en mode strip-only)
function loadModule(modulePath: string): any {
	const cleanPath = modulePath.replace('file://', '')

	return require(cleanPath)
}

export class Plugin {

	// Valeurs communes
	private _path: string
	private _name: string
	private _version: string
	private _valid: boolean = true

	// Valeurs spécifiques
	private _entities: { [key: string]: EntityClass<AnyEntity> }
	private _controllers: { [key: string]: typeof BaseController }
	private _services: { [key: string]: any }
	private _translations: { [key: string]: BaseTranslation }

	constructor(path: string) {
		this._path = path.replace('file://', '')
	}

	public async load(): Promise<void> {
		// Vérifier si le plugin.json est présent
		if (!fs.existsSync(`${this._path}/plugin.json`))
			return this.stopLoad('plugin.json not found')

		// Lire le plugin.json
		const pluginConfig = loadModule(`${this._path}/plugin.json`)

		// Vérifier si le plugin.json est valide
		if (!pluginConfig.name)
			return this.stopLoad('Missing name in plugin.json')
		if (!pluginConfig.version)
			return this.stopLoad('Missing version in plugin.json')
		if (!pluginConfig.tscordRequiredVersion)
			return this.stopLoad('Missing tscordRequiredVersion in plugin.json')

		// Vérifier les valeurs du plugin.json
		if (!pluginConfig.name.match(/^[a-zA-Z0-9-_]+$/))
			return this.stopLoad('Invalid name in plugin.json')
		if (!semver.valid(pluginConfig.version))
			return this.stopLoad('Invalid version in plugin.json')

		// Vérifier la compatibilité avec la version actuelle de TSCord
		if (!semver.satisfies(semver.coerce(getTscordVersion())!, pluginConfig.tscordRequiredVersion))
			return this.stopLoad(`Incompatible with the current version of Tscord (v${getTscordVersion()})`)

		// Assigner les valeurs communes
		this._name = pluginConfig.name
		this._version = pluginConfig.version

		// Charger les valeurs spécifiques
		this._entities = this.getEntities()
		this._controllers = this.getControllers()
		this._services = this.getServices()
		this._translations = await this.getTranslations()
	}

	private stopLoad(error: string): void {
		this._valid = false
		console.error(`Plugin ${this._name ? this._name : this._path} ${this._version ? `v${this._version}` : ''} is not valid: ${error}`)
	}

	private getControllers(): { [key: string]: typeof BaseController } {
		if (!fs.existsSync(`${this._path}/api/controllers`))
			return {}

		return loadModule(`${this._path}/api/controllers`)
	}

	private getEntities(): { [key: string]: EntityClass<AnyEntity> } {
		if (!fs.existsSync(`${this._path}/entities`))
			return {}

		return loadModule(`${this._path}/entities`)
	}

	private getServices(): { [key: string]: any } {
		if (!fs.existsSync(`${this._path}/services`))
			return {}

		return loadModule(`${this._path}/services`)
	}

	private async getTranslations(): Promise<{ [key: string]: BaseTranslation }> {
		const translations: { [key: string]: BaseTranslation } = {}

		const localesPath = await resolve(`${this._path}/i18n/*.{ts,js}`)
		for (const localeFile of localesPath) {
			const cleanPath = localeFile.replace('file://', '')
			const locale = cleanPath.split(sep).at(-1)?.split('.')[0] || 'unknown'

			translations[locale] = loadModule(cleanPath).default
		}

		for (const defaultLocale of locales) {
			const path = `${getSourceCodeLocation()}/i18n/${defaultLocale}/${this._name}/_custom.`
			if (fs.existsSync(`${path}js`))
				translations[defaultLocale] = loadModule(`${path}js`).default
			else if (fs.existsSync(`${path}ts`))
				translations[defaultLocale] = loadModule(`${path}ts`).default
		}

		return translations
	}

	public execMain(): void {
		if (!fs.existsSync(`${this._path}/main.ts`))
			return
		loadModule(`${this._path}/main.ts`)
	}

	public async importCommands(): Promise<void> {
		await importx(`${this._path}/commands/**/*.{ts,js}`)
	}

	public async importEvents(): Promise<void> {
		await importx(`${this._path}/events/**/*.{ts,js}`)
	}

	public isValid(): boolean {
		return this._valid
	}

	get path() {
		return this._path
	}

	get name() {
		return this._name
	}

	get version() {
		return this._version
	}

	get entities() {
		return this._entities
	}

	get controllers() {
		return this._controllers
	}

	get services() {
		return this._services
	}

	get translations() {
		return this._translations
	}

}
