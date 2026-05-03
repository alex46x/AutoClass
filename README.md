<div align="center">
  <h1>UniHub</h1>
  <p>A university management, class scheduling, and attendance tracking system</p>
</div>

## Introduction
In modern academic institutions, managing class routines, attendance, and resource allocation is a complex logistical challenge. UniHub is a software solution designed to streamline the interaction between students, teachers, and class representatives (CRs). The system replaces manual attendance registers and static notice boards with a dynamic, role-based application that offers real-time insights into academic schedules and classroom availability.

## Background
Currently, the university operates using traditional manual methods:
- **Paper Attendance Sheets**: Prone to damage, loss, and data entry errors.
- **Static Routines**: Printed routines do not reflect last-minute cancellations or room changes.
- **Manual Room Hunting**: Class Representatives often have to physically search the campus for empty rooms to schedule makeup classes.

While generic "School Management Systems" exist, they often lack specific features required for university logistics, such as "makeup class management" or "Class Representative privileges." UniHub bridges that gap.

## Problem Statements
- **Attendance Anxiety**: Students often lose track of their attendance percentage, leading to unexpected "Collegiate" or "Non-Collegiate" status.
- **Resource Conflict**: Teachers and CRs struggle to find available classrooms equipped with specific tools (e.g., Projectors) for extra classes.
- **Data Redundancy**: Teachers waste significant time manually transferring attendance data from paper to Excel sheets.

## Project Architecture & Features

The project implements a Role-Based Access Control system with four distinct user personas:

### 🎓 Student Module
- **Smart Dashboard**: Displays daily and weekly routines with course details (Teacher, Room No).
- **Attendance Analytics**: Features a "Safe/Warning/Danger" indicator that visually alerts students if their attendance drops below the required threshold.
- **Digital Timetable**: Options to view personal timetables and attendance summaries.

### 👑 Class Representative (CR) Privileges
- **Smart Room Finder**: A unique feature allowing CRs to view a list of empty classrooms for specific time slots.
- **Infrastructure Filtering**: Ability to filter rooms based on capacity or equipment (e.g., "Room with Projector") for arranging makeup classes or lab sessions.

### 👨‍🏫 Teacher Module
- **Digital Attendance**: Teachers can mark attendance (Present/Absent/Late) with a streamlined interface.
- **Resource Visibility**: Teachers can view enrolled student lists, assigned courses, and classroom schedules.

## Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Next.js Server Actions & API Routes
- **Database**: SQLite with Drizzle ORM
- **Authentication**: Custom JWT authentication with Jose and bcryptjs

## Getting Started

### Prerequisites
- Node.js (v20+ recommended)

### Run Locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.

**Seed Credentials:**
Set the `SEED_*_PASSWORD` environment variables before using `/api/setup`. The seeded demo emails are:
- student@university.edu
- teacher@university.edu
- head@university.edu
- cr@university.edu
- admin@university.edu

To seed manually, set `SETUP_TOKEN` and open `/api/setup?token=YOUR_SETUP_TOKEN`.

## Social and Economic Value
- **Academic Value**: The "Safe/Warning" indicators directly contribute to better student performance by encouraging regular attendance.
- **Operational Efficiency**: Eliminates the "walking time" for CRs and teachers looking for empty rooms.
- **Environmental Impact**: Reduces paper usage by digitizing daily attendance sheets and routine notices.
