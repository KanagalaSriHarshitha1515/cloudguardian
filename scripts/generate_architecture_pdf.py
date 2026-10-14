from pathlib import Path

try:
    import reportlab  # noqa: F401
except Exception:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'reportlab'])

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors

workspace = Path(r'c:\Users\harsh\OneDrive\Desktop\cloudguardian')
out = workspace / 'cloudguardian_architecture.pdf'

styles = getSampleStyleSheet()
body_style = ParagraphStyle('Body', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14)
small = ParagraphStyle('Small', parent=body_style, fontSize=9)

content = []
content.append(Paragraph('CloudGuardian Architecture & Working Conditions', styles['Title']))
content.append(Spacer(1, 16))
content.append(Paragraph(
    'CloudGuardian is a Docker resource management platform that exposes a web interface and REST API to manage containers, images, volumes, networks, services, stacks, and Docker Swarm resources. It uses a Node.js backend, a React frontend, PostgreSQL, Prisma ORM, and Docker daemon access through Dockerode.',
    body_style,
))
content.append(Spacer(1, 12))

content.append(Paragraph('1. High-level architecture', styles['Heading2']))
for item in [
    'Frontend: React + Vite + Material UI, served on port 8080',
    'Backend: Express.js REST API, JWT auth, Swagger UI, rate limiting, logging, served on port 5000',
    'Database: PostgreSQL 16, accessed through Prisma ORM',
    'Docker integration: Dockerode talks to the local Docker daemon / connected Docker hosts for container resource operations',
    'Deployment: Docker Compose runs postgres, backend, and frontend as separate containers with health checks and restart policies',
]:
    content.append(Paragraph(f'• {item}', body_style))
content.append(Spacer(1, 12))

content.append(Paragraph('2. Runtime flow', styles['Heading2']))
for idx, item in enumerate([
    'User opens the frontend in the browser.',
    'Frontend requests API endpoints through Axios for auth, projects, containers, services, stacks, etc.',
    'Express backend validates the request, applies CORS, Helmet, rate limiting, and JWT checks where required.',
    'Prisma reads or writes application data to PostgreSQL.',
    'For Docker operations, the backend uses Dockerode to send requests to Docker hosts and retrieve container, image, network, volume, and swarm data.',
    'The API returns JSON to the frontend, which renders dashboards and management screens.',
], start=1):
    content.append(Paragraph(f'{idx}. {item}', body_style))
content.append(Spacer(1, 12))

content.append(Paragraph('3. Main project structure', styles['Heading2']))
rows = [
    ['frontend', 'React app (Vite + React Router + MUI)'],
    ['backend', 'Express API and business logic'],
    ['backend/src/routes', 'Route registration for auth, users, projects, docker hosts, containers, etc.'],
    ['backend/src/controllers', 'Request handlers'],
    ['backend/src/middleware', 'Auth, validation, error handling, logging, rate limiting'],
    ['backend/src/config', 'Prisma and Swagger configuration'],
    ['backend/prisma', 'Schema and migrations for PostgreSQL'],
    ['docker-compose.yml', 'Starts Postgres, backend, and frontend containers'],
    ['scripts/', 'Backup and health check scripts for Windows'],
]

table = Table(rows, colWidths=[120, 400])
table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1f4e79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
content.append(table)
content.append(Spacer(1, 16))

content.append(Paragraph('4. Working conditions / setup requirements', styles['Heading2']))
for item in [
    'Docker and Docker Compose installed on the machine or server',
    'Node.js 18+ for local development',
    'PostgreSQL database available to the backend or via Docker container',
    '.env values such as POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, JWT_SECRET, JWT_EXPIRES_IN, and CORS_ORIGIN',
    'The backend checks database connectivity on startup and exits if PostgreSQL is unavailable',
    'Docker Compose health checks ensure backend starts only after PostgreSQL is healthy and frontend starts only after backend is healthy',
    'The app exposes: frontend on http://localhost:8080, backend on http://localhost:5000, Swagger at http://localhost:5000/api/docs',
]:
    content.append(Paragraph(f'• {item}', body_style))
content.append(Spacer(1, 12))

content.append(Paragraph('5. Local startup commands', styles['Heading2']))
for cmd in [
    'cd backend',
    'npm install',
    'npx prisma generate',
    'npx prisma migrate dev',
    'npm run dev',
    'docker compose up --build -d',
]:
    content.append(Paragraph(f'<font name="Courier">{cmd}</font>', small))
    content.append(Spacer(1, 5))

content.append(Spacer(1, 12))
content.append(Paragraph('6. Operational notes', styles['Heading2']))
for item in [
    'Backend uses JWT auth, so protected routes require Authorization: Bearer <token>.',
    'The backend health endpoint is /health and verifies database connectivity.',
    'For HTTPS in production, use the optional Caddy profile and publish ports 80 and 443.',
    'For production hardening, keep secrets in a manager, restrict CORS origin, and perform regular database backups.',
]:
    content.append(Paragraph(f'• {item}', body_style))
content.append(Spacer(1, 20))
content.append(Paragraph('Generated for project review: CloudGuardian', styles['Italic']))

doc = SimpleDocTemplate(str(out), pagesize=A4)
doc.build(content)
print(f'Created PDF: {out}')
