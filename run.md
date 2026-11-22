# Run the CodeXCourse apps

Start each app in a separate terminal from the repository root.

## 1. Public frontend

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173).

## 2. Student portal

```powershell
cd student
npm run dev
```

Open [http://localhost:5174](http://localhost:5174). Successful student logins from the public frontend redirect here.

## 3. Admin portal

```powershell
cd admin
npm run dev
```

Open [http://localhost:5175](http://localhost:5175). The admin app uses port `5175` so it does not take the student portal's port.

Restart the dev servers after changing their Vite configuration. For deployments, set `VITE_STUDENT_APP_URL` to the deployed student portal URL in the public frontend environment.
