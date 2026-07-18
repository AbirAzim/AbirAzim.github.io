#!/usr/bin/env python3
"""Generate Abir Azim Badhon resume PDF into assets/resume.pdf"""

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "resume.pdf"


class ResumePDF(FPDF):
    def __init__(self):
        super().__init__(format="A4")
        self.set_auto_page_break(auto=True, margin=12)
        self.set_margins(14, 12, 14)

    def section_title(self, title: str):
        self.ln(1)
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(15, 23, 42)
        self.cell(0, 7, title.upper(), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(45, 212, 191)
        self.set_line_width(0.5)
        y = self.get_y()
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(2.5)

    def body(self, text: str, bold: bool = False, size: float = 9.5):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "B" if bold else "", size)
        self.set_text_color(30, 41, 59)
        self.multi_cell(0, 4.4, text)
        self.set_x(self.l_margin)

    def muted(self, text: str, size: float = 8.5):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", size)
        self.set_text_color(71, 85, 105)
        self.multi_cell(0, 4.0, text)
        self.set_x(self.l_margin)

    def bullet(self, text: str):
        self.set_x(self.l_margin)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(30, 41, 59)
        usable = self.w - self.l_margin - self.r_margin
        self.cell(4, 4.2, "-")
        self.multi_cell(usable - 4, 4.2, text)
        self.set_x(self.l_margin)


def build():
    pdf = ResumePDF()
    pdf.add_page()

    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 8, "Abir Azim Badhon", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(13, 148, 136)
    pdf.cell(0, 6, "Backend Software Engineer  |  5+ Years Experience", new_x="LMARGIN", new_y="NEXT")

    pdf.muted(
        "Dhaka, Bangladesh  |  badhonkhanbk007@gmail.com  |  github.com/AbirAzim"
    )
    pdf.muted(
        "linkedin.com/in/badhon-khan-007  |  abirazim.github.io  |  aka Badhon Khan / bk007"
    )

    pdf.section_title("Professional Summary")
    pdf.body(
        "Backend software engineer with 5+ years of software development experience and "
        "4+ years shipping production GraphQL and AWS backends. Builds scalable APIs, "
        "multi-tenant systems, and full-stack products with clear architecture and long-term maintainability."
    )

    pdf.section_title("Professional Experience")

    pdf.body("Data Savvy Inc.  -  Backend Developer (USA-based startup)", bold=True)
    pdf.muted("Nov 2021 - Present")
    pdf.bullet(
        "Doerfy: monorepo GraphQL backend (GraphQL Yoga, TypeGraphQL, Express) with schema-first resolvers across 50+ domains."
    )
    pdf.bullet(
        "Bigtopa: multi-tenant AWS backend with Cognito auth, AppSync pipeline resolvers, EventBridge -> Lambda notifications + Pusher."
    )
    pdf.bullet(
        "Blending101: Node.js GraphQL API (Apollo / type-graphql, MongoDB) for nutrition and recipe platform features."
    )
    pdf.ln(1)

    pdf.body("Stack Learner  -  Programming Trainer", bold=True)
    pdf.muted("Jun 2020 - Apr 2021")
    pdf.bullet(
        "Mentored ~100 students in C, Java, and JavaScript fundamentals under the SL3 program."
    )
    pdf.bullet(
        'Designed and delivered TypeScript YouTube course: "TypeScript All You Need to Know".'
    )

    pdf.section_title("Featured Projects")

    pdf.body("Ke Jitbe (personal)  -  Social comparison voting app", bold=True)
    pdf.muted("Web: https://www.kejitbe.app  |  Play Store: com.ctrend.app")
    pdf.bullet(
        "Full-stack product (formerly CTrend): side-by-side comparisons, real-time voting, feed, chat, coins, campaigns."
    )
    pdf.bullet(
        "NestJS + Apollo GraphQL + MongoDB API; React 19 / Vite web + Expo React Native Android client."
    )
    pdf.ln(0.8)

    pdf.body("Bigtopa  -  Multi-tenant platform backend", bold=True)
    pdf.muted("Live: https://app.bigtopa.com")
    pdf.bullet(
        "Tenant-scoped chat, meetings, blogs, and tooling on TypeScript, AWS CDK, AppSync, Lambda, MongoDB."
    )
    pdf.ln(0.8)

    pdf.body("Doerfy  -  GraphQL monorepo backend", bold=True)
    pdf.muted("Live: https://dev.doerfy.com")
    pdf.bullet(
        "Production GraphQL Yoga / TypeGraphQL / Express API with schema-first resolvers across 50+ feature domains."
    )
    pdf.ln(0.8)

    pdf.body("Blending101  -  Blending Recipe API", bold=True)
    pdf.muted("Live: https://app.blending101.com")
    pdf.bullet(
        "Node.js GraphQL API for recipes, ingredients, nutrients, member content, and planning on MongoDB."
    )

    pdf.section_title("Skills")
    pdf.body("Languages: TypeScript, JavaScript, Node.js", size=9)
    pdf.body(
        "Backend: GraphQL, GraphQL Yoga, TypeGraphQL, NestJS, Express, REST, schema-first design",
        size=9,
    )
    pdf.body(
        "Data / realtime: MongoDB, Mongoose, PostgreSQL, DynamoDB, Redis, TypeORM, Pusher, event-driven design",
        size=9,
    )
    pdf.body("AWS: Lambda, CDK, AppSync, Cognito, EventBridge, DynamoDB", size=9)
    pdf.body(
        "DevOps: Docker, CI/CD, GitHub Actions, Jest, multi-tenancy, monorepo backends",
        size=9,
    )

    pdf.section_title("Education")
    pdf.body(
        "Daffodil International University  -  B.Sc. in Software Engineering (2025)",
        bold=True,
    )
    pdf.muted("Dhaka, Bangladesh")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    build()
