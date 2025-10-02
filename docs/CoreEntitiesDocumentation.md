# Core Entities Documentation - Frontend

This document provides an overview of the core entities managed in the frontend state of the TestMarks application, based on the Redux slices and thunks implemented.

---

## 1. Auth (Authentication)

**Purpose:** Manage user authentication state including login, registration, token management, and user details.

**Key Properties:**
- `user`: User object with id, name, email, mobile number, and other profile details.
- `token`: JWT token string.
- Actions: login, register, loadToken, logout.

---

## 2. User

**Purpose:** Manage user profiles and role-based user lists.

**Key Properties:**
- `users`: Array of user objects with id, name, email, role, profile picture, and profile details.
- `count`: Total number of users.
- Actions: Fetch users by role.

---

## 3. Marks

**Purpose:** Manage marks data for students including fetching, updating, and bulk updating marks.

**Key Properties:**
- `marks`: Array of marks records with test info, student info, marks obtained, status, approval info.
- Actions: Fetch marks, update marks, bulk update marks.

---

## 4. Teacher Dashboard

**Purpose:** Manage teacher dashboard data including assigned classes, sections, students, tests, and related info.

**Key Properties:**
- `teacherDetails`: Teacher's personal info.
- `assignedClasses`: Array of classes with subjects, sections, students, and tests.

---

## 5. Student Dashboard

**Purpose:** Manage student dashboard data including student info, completed tests, pending tests, upcoming tests, and summary.

**Key Properties:**
- `student`: Student personal info.
- `completed_tests`, `pending_tests`, `upcoming_tests`: Arrays of test objects with marks and teacher info.
- `summary`: Counts of tests by status.

---

## 6. Create Test

**Purpose:** Manage state related to creating tests and notifying students.

**Key Properties:**
- `data`: Response data including message and test object.

---

## 7. Class Management

**Purpose:** Manage creation of classes and related sections.

**Key Properties:**
- `classData`: Created class data.
- `sectionData`: Created section data.

---

## Application Flow

### Admin Flow
1. **Login/Signup**: Admin logs in or registers with admin role.
2. **Admin Home Screen**: Dashboard showing overview of the system.
3. **User Management**: Add users (teachers, students), manage existing users.
4. **Class Management**: Create classes and sections.
5. **Test Management**: View and manage tests created by teachers.
6. **Settings**: Configure app settings.

### Teacher Flow
1. **Login/Signup**: Teacher logs in or registers with teacher role.
2. **Teacher Home Screen**: Dashboard showing assigned classes, sections, students, and tests.
3. **Create Test**: Create new tests for assigned classes/sections/subjects, notify students.
4. **Marks Management**: View student marks, update individual marks, bulk update marks.
5. **Test Ranking**: View and manage test rankings.
6. **Section Management**: Add teachers to sections.

### Student Flow
1. **Login/Signup**: Student logs in or registers with student role.
2. **Student Home Screen**: Dashboard showing personal info, completed tests with marks, pending tests, upcoming tests, and summary.
3. **View Marks**: See marks for completed tests, feedback from teachers.

---

This documentation can be extended as new features and entities are added to the frontend.
