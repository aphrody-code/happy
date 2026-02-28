module.exports = {
	apps: [{
		name: 'fairy-tail-fr',
		script: 'build/main.js',
		cwd: '/root/happy',
		max_memory_restart: '300M',
		exp_backoff_restart_delay: 100,
		env: {
			NODE_ENV: 'production',
		},
		error_file: './logs/pm2-error.log',
		out_file: './logs/pm2-out.log',
		merge_logs: true,
		time: true,
		watch: false,
		autorestart: true,
	}],
}
