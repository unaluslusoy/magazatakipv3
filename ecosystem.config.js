module.exports = {
    apps: [{
        name: 'magazapano-backend',
        script: './src/app.js',
        cwd: './backend',
        instances: 'max', // CPU sayısı kadar instance
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'production',
            PORT: 3000
        },
        env_development: {
            NODE_ENV: 'development',
            PORT: 3000
        },
        error_file: './logs/backend-error.log',
        out_file: './logs/backend-out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        merge_logs: true,
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s',
        restart_delay: 4000
    }],

    deploy: {
        production: {
            user: 'deploy',
            host: 'your-server.com',
            ref: 'origin/main',
            repo: 'git@github.com:username/magazapano.git',
            path: '/var/www/magazapano',
            'post-deploy': 'cd backend && npm install && cd ../admin-panel && npm install && npm run build && pm2 reload ecosystem.config.js',
            'pre-setup': ''
        }
    }
};