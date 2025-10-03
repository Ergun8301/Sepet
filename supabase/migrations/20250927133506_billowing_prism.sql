/*
  # Initial Schema Setup for ResQ Food Marketplace

  1. New Tables
    - `profiles` - User profile information
    - `merchants` - Merchant/business information
    - `categories` - Food/offer categories
    - `offers` - Food offers and deals
    - `reviews` - Merchant reviews and ratings
    - `blog_posts` - Blog content management
    - `partners` - Partner companies
    - `banner_slides` - Homepage banner content

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure merchant and admin operations

  3. Relationships
    - Link profiles to auth.users
    - Connect offers to merchants and categories
    - Associate reviews with merchants and users
*/

-- Profiles table for additional user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  first_name text,
  last_name text,
  avatar_url text,
  account_type text DEFAULT 'personal' CHECK (account_type IN ('personal', 'merchant')),
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  description text,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  cover_image_url text,
  rating decimal(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  verified boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon_url text,
  created_at timestamptz DEFAULT now()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id),
  title text NOT NULL,
  description text,
  original_price decimal(10,2),
  discounted_price decimal(10,2),
  discount_percentage integer,
  image_url text,
  tags text[],
  available_from timestamptz,
  available_until timestamptz,
  max_quantity integer,
  current_quantity integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES merchants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  title text,
  comment text,
  helpful_votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  featured_image_url text,
  tags text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean DEFAULT false,
  views integer DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo_url text,
  website_url text,
  description text,
  featured boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Banner slides table
CREATE TABLE IF NOT EXISTS banner_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text,
  cta_text text,
  cta_link text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE banner_slides ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Merchants policies
CREATE POLICY "Merchants are viewable by everyone"
  ON merchants FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can create merchant profiles"
  ON merchants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own merchant profile"
  ON merchants FOR UPDATE
  USING (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Offers policies
CREATE POLICY "Active offers are viewable by everyone"
  ON offers FOR SELECT
  USING (status = 'active');

CREATE POLICY "Merchants can manage their offers"
  ON offers FOR ALL
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE user_id = auth.uid()
    )
  );

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Blog posts policies
CREATE POLICY "Published blog posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can manage their blog posts"
  ON blog_posts FOR ALL
  USING (auth.uid() = author_id);

-- Partners policies
CREATE POLICY "Partners are viewable by everyone"
  ON partners FOR SELECT
  USING (true);

-- Banner slides policies
CREATE POLICY "Active banner slides are viewable by everyone"
  ON banner_slides FOR SELECT
  USING (active = true);

-- Insert sample data
INSERT INTO categories (name, slug, description) VALUES
  ('Fast Food', 'fast-food', 'Quick and convenient meals'),
  ('Healthy', 'healthy', 'Nutritious and wholesome options'),
  ('Vegetarian', 'vegetarian', 'Plant-based meals'),
  ('Desserts', 'desserts', 'Sweet treats and desserts');

INSERT INTO partners (name, logo_url, website_url, featured, display_order) VALUES
  ('FoodTech Solutions', 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200', 'https://example.com', true, 1),
  ('Green Delivery', 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200', 'https://example.com', true, 2),
  ('Organic Farms', 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200', 'https://example.com', true, 3);

INSERT INTO banner_slides (title, subtitle, image_url, cta_text, cta_link, display_order) VALUES
  ('Save money, save food together', 'Discover amazing deals on delicious meals and help reduce food waste', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Explore Offers', '/offers', 1),
  ('Fresh ingredients daily', 'Partner with us to reach more customers', 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200', 'Join as Merchant', '/auth', 2);