#  Ubuntu Garden Lounge

Modern African restaurant website with online ordering and reservations.

##  Live Demo
*Coming soon - Currently in development*

##  Features

###  Completed
- **Frontend Pages**: Home, Menu, Gallery, About, Contact, Reservations, Checkout
- **Database**: PostgreSQL with Prisma ORM
- **Menu API**: /api/menu serving 8 African dishes
- **Shopping Cart**: Full functionality with Context API
- **Design**: African aesthetic (forest green, gold, cream)
- **Responsive**: Mobile-first design

###  In Progress
- Admin dashboard for menu management
- Reservation and order API endpoints
- Email notifications (Resend integration)

### 📅 Planned
- Customer accounts
- Order tracking
- Analytics dashboard
- Mobile app

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Styling**: Framer Motion, Lucide React icons
- **Hosting**: Vercel (planned)

## 📁 Project Structure

\\\
ubuntu-garden-lounge/
├── prisma/           # Database schema & migrations
├── src/app/          # Next.js pages & API routes
├── src/components/   # React components
├── src/contexts/     # React contexts (CartContext)
├── src/lib/          # Utilities (prisma client)
 public/           # Static assets
\\\

##  Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 16+
- npm or yarn

### Installation

1. Clone the repository:
\\\ash
git clone https://github.com/Sibahle01/ubuntu-garden-lounge.git
cd ubuntu-garden-lounge
\\\

2. Install dependencies:
\\\ash
npm install
\\\

3. Set up environment variables:
\\\ash
cp .env.example .env.local
# Edit .env.local with your database credentials
\\\

4. Set up database:
\\\ash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
\\\

5. Run development server:
\\\ash
npm run dev
\\\

6. Open [http://localhost:3000](http://localhost:3000)

##  Development Roadmap

### Phase 1: MVP (Current)
- [x] Frontend pages
- [x] Database setup
- [x] Basic API endpoints
- [ ] Admin dashboard
- [ ] Form integrations

### Phase 2: Features
- [ ] Customer authentication
- [ ] Order tracking
- [ ] Email notifications
- [ ] Analytics

### Phase 3: Scale
- [ ] Mobile app
- [ ] Inventory management
- [ ] Staff dashboard

##  Database Schema

\\\prisma
model MenuItem {
  id          String  @id @default(cuid())
  name        String
  description String
  price       Decimal @db.Decimal(10, 2)
  category    String
  imageUrl    String?
  isFeatured  Boolean @default(false)
  isVegetarian Boolean @default(false)
  isSpicy     Boolean @default(false)
  isAvailable Boolean @default(true)
}

model Reservation {
  id        String @id @default(cuid())
  date      DateTime
  time      String
  guests    Int
  name      String
  email     String
  phone     String
  status    ReservationStatus @default(PENDING)
}

model Order {
  id          String @id @default(cuid())
  orderNumber String @unique
  orderType   OrderType
  status      OrderStatus @default(PENDING)
  total       Decimal @db.Decimal(10, 2)
  name        String
  email       String
  phone       String
}
\\\

##  Design System

- **Primary Colors**: 
  - Forest Green: \#1a472a\
  - Gold: \#d4af37\ 
  - Cream: \#f0e6d2\
  - Charcoal: \#2c3e50\

- **Typography**: Inter font family
- **Spacing**: 4px base unit (Tailwind default)

##  Contributing

This is a private project. Contact the repository owner for contribution guidelines.

##  License

All Rights Reserved - Ubuntu Garden Lounge Restaurant
