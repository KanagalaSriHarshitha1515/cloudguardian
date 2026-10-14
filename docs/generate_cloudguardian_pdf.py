from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, PageBreak, Table, TableStyle

OUTPUT_PATH = "C:/Users/harsh/OneDrive/Desktop/cloudguardian/docs/CloudGuardian_Architecture_Working_Condition.pdf"


def build_pdf():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "TitleStyle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1F2937"),
        alignment=1,
    )
    heading_style = ParagraphStyle(
        "HeadingStyle",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=18,
        textColor=colors.HexColor("#111827"),
        spaceBefore=14,
        spaceAfter=8,
    )
    body_style = ParagraphStyle(
        "BodyStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#1F2937"),
    )
    bullet_style = ParagraphStyle(
        "BulletStyle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        leftIndent=18,
        bulletIndent=12,
        textColor=colors.HexColor("#1F2937"),
    )

    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=30,
    )

    story = []
    story.append(Paragraph("CloudGuardian", title_style))
    story.append(Paragraph("Architecture Overview and Working Conditions", styles["Heading1"]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Project purpose", heading_style))
    story.append(Paragraph(
        "CloudGuardian is a Docker resource management platform built for centralized monitoring and administration of containers, images, volumes, networks, services, stacks, and swarm nodes. It provides authentication, project-level isolation, and Docker host operations through APIs.",
        body_style,
    ))

    story.append(Paragraph("1. High-level architecture", heading_style))
    story.append(Paragraph(
        "The system follows a three-tier model: React frontend, Express backend, and PostgreSQL database. The backend communicates with Docker through Dockerode to control remote or local Docker hosts, while the frontend is served through Nginx in a production container.",
        body_style,
    ))

    architecture_rows = [
        ["Layer", "Technology", "Role"],
        ["Frontend", "React + Vite + MUI", "User interface for login, projects, docker management, dashboard screens"],
        ["API Layer", "Express.js + JWT + Swagger", "Handles authentication, validation, API routing and documentation"],
        ["Data Layer", "PostgreSQL + Prisma ORM", "Stores users, projects, teams, and metadata"],
        ["Docker Integration", "Dockerode", "Manages containers, images, volumes, networks, services, stacks, swarm"],
        ["Runtime", "Docker Compose", "Runs PostgreSQL, backend, frontend, and health checks together"],
    ]
    table = Table(architecture_rows, colWidths=[80, 150, 260])
    table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#111827")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#D1D5DB")),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(table)

    story.append(Paragraph("Runtime flow", heading_style))
    story.append(ListFlowable([
        Paragraph("1. User opens the frontend in the browser.", bullet_style),
        Paragraph("2. Frontend sends HTTP requests to the backend REST API on port 5000.", bullet_style),
        Paragraph("3. Backend validates JWT tokens, applies rate limiting and security middleware, and routes requests to relevant controllers.", bullet_style),
        Paragraph("4. Prisma stores application data in PostgreSQL, including users, projects, teams, and host metadata.", bullet_style),
        Paragraph("5. Dockerode connects to the Docker daemon and performs operations like container lifecycle, image pulls, volume creation, network management, and swarm deployment.", bullet_style),
        Paragraph("6. Health checks confirm both database and backend service readiness before the system is treated as healthy.", bullet_style),
    ], bulletType="bullet"))

    story.append(Paragraph("2. System modules", heading_style))
    story.append(Paragraph("The backend is organized into clear functional modules. The route and controller structure is split by feature domain, making the project suitable for container orchestration and Docker-heavy admin tasks.", body_style))
    story.append(ListFlowable([
        Paragraph("Auth: login, registration, JWT issuance and protected route access.", bullet_style),
        Paragraph("Project: create, list, update, and delete project records.", bullet_style),
        Paragraph("Docker Hosts: add and validate remote or local Docker connections.", bullet_style),
        Paragraph("Containers: inspect, start, stop, restart, remove, and tail logs.", bullet_style),
        Paragraph("Images: list, pull, tag, and delete images.", bullet_style),
        Paragraph("Volumes, Networks, Swarm, Services, Stacks: lifecycle management for Docker resources.", bullet_style),
        Paragraph("Teams and Users: organization-level management and access control patterns.", bullet_style),
    ], bulletType="bullet"))

    story.append(Paragraph("3. Project structure", heading_style))
    story.append(Paragraph(
        "The repository is separated into frontend, backend, database configuration, backup scripts, and Docker deployment files. This keeps the UI, API, and infrastructure concerns isolated while still sharing a single compose stack.",
        body_style,
    ))
    story.append(ListFlowable([
        Paragraph("frontend/: React UI and Vite build configuration.", bullet_style),
        Paragraph("backend/: Express API, Prisma schema, controllers, routes, middleware, and Docker integration logic.", bullet_style),
        Paragraph("backend/prisma/: database schema and migrations.", bullet_style),
        Paragraph("docker-compose.yml: orchestrates PostgreSQL, backend, and frontend containers.", bullet_style),
        Paragraph("scripts/: database backup and health check automation.", bullet_style),
        Paragraph("docs/: architecture and documentation assets.", bullet_style),
    ], bulletType="bullet"))

    story.append(Paragraph("4. Working conditions", heading_style))
    story.append(ListFlowable([
        Paragraph("- Environment: Node.js, Docker Engine, Docker Compose, and PostgreSQL are required for the project to run correctly.", bullet_style),
        Paragraph("- Security: JWT is used for protected API access, and the backend applies CORS, Helmet, rate limiting, and logging middleware.", bullet_style),
        Paragraph("- Startup command: docker compose up --build -d from the project root.", bullet_style),
        Paragraph("- Access points: frontend at http://localhost:8080, backend at http://localhost:5000, Swagger at http://localhost:5000/api/docs.", bullet_style),
        Paragraph("- Health monitoring: backend exposes /health and the compose stack waits for PostgreSQL to become healthy before starting the API.", bullet_style),
        Paragraph("- Database setup: Prisma migrations must be run and the DATABASE_URL must point to the PostgreSQL service inside the Docker network.", bullet_style),
    ], bulletType="bullet"))

    story.append(Paragraph("5. Key environment variables", heading_style))
    architecture_rows_2 = [
        ["Variable", "Purpose"],
        ["POSTGRES_USER", "PostgreSQL username"],
        ["POSTGRES_PASSWORD", "Database password"],
        ["POSTGRES_DB", "Database name"],
        ["JWT_SECRET", "Secret key for signing tokens"],
        ["JWT_EXPIRES_IN", "Token expiration duration"],
        ["CORS_ORIGIN", "Allowed frontend origin"],
        ["PORT", "Backend port (default 5000)"],
    ]
    table2 = Table(architecture_rows_2, colWidths=[180, 320])
    table2.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#111827")),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#D1D5DB")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
        ])
    )
    story.append(table2)

    story.append(Paragraph("6. Production and operational notes", heading_style))
    story.append(ListFlowable([
        Paragraph("- Containers are configured with restart policies so they recover after host restarts.", bullet_style),
        Paragraph("- The backend health endpoint validates database availability before returning a healthy status.", bullet_style),
        Paragraph("- Backups can be generated through scripts in the scripts folder, which is useful for PostgreSQL continuity.", bullet_style),
        Paragraph("- The optional Caddy setup can enable HTTPS and TLS termination when the deployment is exposed to the public internet.", bullet_style),
    ], bulletType="bullet"))

    story.append(Paragraph("Summary", heading_style))
    story.append(Paragraph("CloudGuardian is a modular Docker administration platform with a React frontend, Express API, Prisma-backed PostgreSQL database, and Dockerode-based orchestration layer. It is designed to run reliably in a Docker Compose environment, with explicit health checks, JWT protection, and a modular service structure for future expansion.", body_style))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print("PDF created at: " + OUTPUT_PATH)
