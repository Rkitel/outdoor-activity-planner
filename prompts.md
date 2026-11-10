# Conversation Prompts History

This document records all user prompts submitted during the creation, debugging, and deployment of the **StrideCast SG** (Outdoor Activity Planner for Runners, Cyclists, and Outdoor Enthusiasts).

---

## Prompt 1: Initial App Creation & Meteorological Requirements
**Timestamp:** 2026-11-09T21:54:45-08:00

```text
Activity Planner for Runners, Cyclists, and Outdoor Enthusiasts
Core idea: Suggest the best time slots for outdoor exercise based on weather and air quality.

Uses:

Wind speed

Temperature

Humidity

Rainfall

PM2.5 / PSI

2‑hr forecast

Features:

“Best running window today”

Heat stress warnings

Haze‑safe exercise recommendations

Route suggestions (e.g., Marina Bay, East Coast Park) with micro‑climate overlays

i have my own endpoints: 

https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
https://api-open.data.gov.sg/v2/real-time/api/twenty-four-hr-forecast
https://api-open.data.gov.sg/v2/real-time/api/four-day-outlook
https://api-open.data.gov.sg/v2/real-time/api/air-temperature
https://api-open.data.gov.sg/v2/real-time/api/rainfall
https://api-open.data.gov.sg/v2/real-time/api/psi
https://api-open.data.gov.sg/v2/real-time/api/pm25
https://api-open.data.gov.sg/v2/real-time/api/uv
https://api-open.data.gov.sg/v2/real-time/api/relative-humidity
https://api-open.data.gov.sg/v2/real-time/api/wind-speed
```

---

## Prompt 2: Adding Health & API Availability Modules
**Timestamp:** 2026-11-09T22:04:04-08:00

```text
create the health.ts and the apiavailability.ts in the same root folder
```

---

## Prompt 3: Pushing to Remote GitHub Repository
**Timestamp:** 2026-11-09T22:06:16-08:00

```text
git push https://[TOKEN]@github.com/Rkitel/outdoor-activity-planner.git
```
*(GitHub Personal Access Token masked for security in documentation)*

---

## Prompt 4: Relocating Endpoints to `/api` Directory
**Timestamp:** 2026-11-09T22:10:11-08:00

```text
move health.ts and apiavailability.ts into a /api folder
```

---

## Prompt 5: Troubleshooting 404 Errors on `/api/health`
**Timestamp:** 2026-11-09T22:12:34-08:00

```text
i cant access the api/health or api/apiavailability, it results in error 404. could it be because there is no api key but only an endpoint?
```

---

## Prompt 6: Requesting Serverless Architecture
**Timestamp:** 2026-11-09T22:16:25-08:00

```text
i still cannot access the api/health. i need it to be serverless. Where do i put the endpoints?
```

---

## Prompt 7: Clarifying Serverless Mechanism
**Timestamp:** 2026-11-09T22:20:36-08:00

```text
why did the serverless connection make it work?
```

---

## Prompt 8: Clarifying Host Requirements (Vercel/Netlify vs Others)
**Timestamp:** 2026-11-09T22:26:51-08:00

```text
so only for vercel and netlify i will need to specify serverless connection?
```

---

## Prompt 9: Exporting Prompts History
**Timestamp:** 2026-11-09T22:34:59-08:00

```text
save all my prompts into a prompts.md file
```
