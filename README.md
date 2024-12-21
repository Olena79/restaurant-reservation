# Restaurant Reservation System

This project is a full-stack application for managing restaurant reservations. It includes a frontend for users to select tables and time slots, a backend API for handling reservations, and a database for storing reservation data.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MySQL** database server
- **Git**

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/Olena79/restaurant-reservation.git
cd restaurant-reservation
```

### 2. Setup the Backend

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the database:

   - Create a new MySQL database (e.g., `reservations_db`).

   ```sql
     `CREATE DATABASE reservations_db;`
   ```

   - Create a new user app_user with the given password:

   ```sql
    CREATE USER 'app_user'@'%' IDENTIFIED BY 'f&34$X-YZCe12r';
   ```

- Grant full access rights to the reservations_db database:

```sql
  GRANT ALL PRIVILEGES ON reservations_db.* TO 'app_user'@'%';
  FLUSH PRIVILEGES;
```

- Activate the database for work:

```sql
  USE reservations_db;
```

- Create the reservations table:

```sql
  CREATE TABLE reservations (
      id INT(11) NOT NULL AUTO_INCREMENT,
      reservation_date DATE NOT NULL,
      table_id INT(11) NOT NULL,
      slot_id INT(11) NOT NULL,
      status ENUM('available', 'reserved') DEFAULT 'reserved',
      PRIMARY KEY (id),
      KEY (reservation_date),
      KEY (table_id),
      KEY (slot_id)
  );
```

- Create the slots table:

```sql
  CREATE TABLE slots (
    id INT(11) NOT NULL AUTO_INCREMENT,
    time TIME NOT NULL,
    PRIMARY KEY (id)
  );
```

- Update the `.env` file in the `back` directory with your database credentials:

  ```env
  DB_HOST=localhost
  DB_USER=app_user
  DB_PASSWORD=f&34$X-YZCe12r
  DB_NAME=reservations_db
  ```

4. Start the backend server:

   ```bash
   npm run dev
   ```

   By default, the server runs on `http://localhost:5000`.

### 3. Setup the Frontend

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

   By default, the frontend runs on `http://localhost:3000`.

### 4. Verify the Application

1. Open the frontend in your browser: [http://localhost:3000](http://localhost:3000)
2. Test the reservation system by selecting a date, table, and time.

## Running the App Locally

### Backend

Ensure that the backend server is running:

```bash
cd back
npm run dev
```

### Frontend

Start the frontend development server:

```bash
cd front
npm start
```

### Database

Make sure the MySQL server is running, and the database is correctly configured.

- To check the database connection, use a MySQL client or the command line:

  ```bash
  mysql -u app_user -p
  PASSWORD=f&34$X-YZCe12r
  ```

## Additional Notes

- The backend exposes the following endpoints:

  - `GET /api/reservations`: Fetch reservations for a specific table and date.
  - `POST /api/reservations`: Create a new reservation.
  - `DELETE /api/reservations`: Delete a reservation by ID.

- The frontend dynamically displays available and reserved time slots based on API responses.
- Ensure CORS is configured correctly if you deploy the frontend and backend on different domains.

## Troubleshooting

1. **Frontend not connecting to backend**:

   - Check that the backend server is running on the correct port (`5000`).
   - Verify the backend URL in the frontend configuration.

2. **Database errors**:

   - Verify your `.env` file in the backend folder.
   - Ensure the database schema has been imported correctly.

3. **Missing dependencies**:
   - Run `npm install` in both `front` and `back` folders.
