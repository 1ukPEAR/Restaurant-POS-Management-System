# Restaurant POS Management System

A full-stack restaurant management and Point of Sale (POS) system designed to support daily restaurant operations, including authentication, menu management, table management, order processing, payment, billing, sales summary, and user management.

## Overview

The system is a web-based restaurant management platform with two main user roles: Owner and Worker.

It provides features for managing restaurant information, menus, tables, orders, payments, billing, sales data, and user accounts through a centralized web application.

## Screenshots

### User Interface

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/roles/role-owner-dashboard.png" alt="Owner Dashboard">
    </td>
    <td width="50%">
      <img src="docs/screenshots/roles/role-owner-order.png" alt="Owner Order">
    </td>
  </tr>
  <tr>
    <td align="center"><b>Owner Dashboard</b></td>
    <td align="center"><b>Order Management</b></td>
  </tr>
</table>

<table>
  <tr>
    <td width="50%">
      <img src="docs/screenshots/roles/role-owner-tables.png" alt="Table Management">
    </td>
    <td width="50%">
      <img src="docs/screenshots/roles/role-owner-menus.png" alt="Menu Management">
    </td>
  </tr>
  <tr>
    <td align="center"><b>Table Management</b></td>
    <td align="center"><b>Menu Management</b></td>
  </tr>
</table>

## Features

- Login, registration, OTP verification, and password reset
- JWT-protected API routes
- Restaurant profile and telephone management
- Menu management with image upload support
- Table management and table-based ordering
- Order creation, updates, payment, cancellation, and billing
- Order history and sales summary
- User and worker management
- Swagger UI for backend API documentation

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router |
| Styling | Tailwind CSS |
| Backend | Node.js, Express 5 |
| Database | MongoDB |
| Additional | JavaScript, JWT, Socket.IO, Multer, Cloudinary, Swagger |

## My Contribution

### Front-End Developer & Web Designer

Worked as a Front-End Developer and Web Designer as part of the development team.

- Developed the frontend using React.js and JavaScript
- Designed and developed the user interface for the restaurant management system
- Designed responsive layouts to support different screen sizes and usage scenarios
- Connected the frontend with backend services and database-related functionality

## Project Structure

```text
WebServices-Sun-Pear/
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── src/
│   │   ├── controller/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── model/
│   │   ├── routes/
│   │   └── utils/
│   └── MongoJson/
├── frontend/
│   └── src/
└── docs/
    └── screenshots/
