{
  "apps": [
    {
      "name": "imobi-import-scheduler",
      "script": "cron/scheduler.js",
      "cwd": "d:/IMob/directus",
      "instances": 1,
      "autorestart": true,
      "watch": false,
      "max_memory_restart": "200M",
      "env": {
        "NODE_ENV": "production",
        "DIRECTUS_URL": "http://localhost:8055",
        "ADMIN_EMAIL": "marcus@admin.com",
        "ADMIN_PASSWORD": "Teste@123",
        "COMPANY_ID": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d"
      },
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z",
      "error_file": "d:/IMob/logs/scheduler-error.log",
      "out_file": "d:/IMob/logs/scheduler-out.log",
      "merge_logs": true
    }
  ]
}
