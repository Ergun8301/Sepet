import { supabase, isSupabaseAvailable } from './supabaseClient';

// Types
export interface Offer {
  id: string;
  title: string;
  description: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  image_url: string;
  merchant: {
    company_name: string;
    full_address: string;
    street: string;
    city: string;
    avg_rating: number;
  };
  available_until: string;
}

export interface Merchant {
  id: string;
  company_name: string;
  full_address: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  avg_rating: number;
  logo_url?: string;
  points: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  featured_image_url?: string;
  published_at: string;
  created_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo_url: string;
  website_url?: string;
  description?: string;
}

export interface BannerSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
}

// Données de démonstration
const mockOffers: Offer[] = [
  {
    id: '1',
    title: 'Fresh Mediterranean Bowl',
    description: 'Quinoa, grilled vegetables, feta cheese, and tahini dressing',
    original_price: 15.99,
    discounted_price: 9.99,
    discount_percentage: 38,
    image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    merchant: {
      company_name: 'Green Kitchen',
      full_address: '123 Health St, Paris, 75001, France',
      street: '123 Health St',
      city: 'Paris',
      avg_rating: 4.8,
    },
    available_until: '2025-01-20T18:00:00Z',
  },
  {
    id: '2',
    title: 'Artisan Pizza Margherita',
    description: 'Hand-tossed dough, san marzano tomatoes, fresh mozzarella',
    original_price: 18.50,
    discounted_price: 12.99,
    discount_percentage: 30,
    image_url: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
    merchant: {
      company_name: 'Nonna\'s Kitchen',
      full_address: '456 Italian Ave, Lyon, 69001, France',
      street: '456 Italian Ave',
      city: 'Lyon',
      avg_rating: 4.9,
    },
    available_until: '2025-01-20T20:00:00Z',
  },
  {
    id: '3',
    title: 'Gourmet Burger & Fries',
    description: 'Grass-fed beef, artisan bun, crispy sweet potato fries',
    original_price: 22.00,
    discounted_price: 14.99,
    discount_percentage: 32,
    image_url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
    merchant: {
      company_name: 'Burger Craft',
      full_address: '789 Food Court, Marseille, 13001, France',
      street: '789 Food Court',
      city: 'Marseille',
      avg_rating: 4.7,
    },
    available_until: '2025-01-20T21:00:00Z',
  },
];

const mockMerchants: Merchant[] = [
  {
    id: '1',
    company_name: 'Green Kitchen',
    description: 'Healthy, organic meals made with locally sourced ingredients',
    full_address: '123 Health St, Paris, 75001, France',
    street: '123 Health St',
    city: 'Paris',
    postal_code: '75001',
    country: 'France',
    avg_rating: 4.8,
    total_reviews: 124,
    verified: true,
    logo_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '2',
    company_name: 'Nonna\'s Kitchen',
    description: 'Authentic Italian cuisine with traditional family recipes',
    full_address: '456 Italian Ave, Lyon, 69001, France',
    street: '456 Italian Ave',
    city: 'Lyon',
    postal_code: '69001',
    country: 'France',
    avg_rating: 4.9,
    total_reviews: 89,
    verified: true,
    logo_url: 'https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: '3',
    company_name: 'Burger Craft',
    description: 'Gourmet burgers made with premium grass-fed beef',
    full_address: '789 Food Court, Marseille, 13001, France',
    street: '789 Food Court',
    city: 'Marseille',
    postal_code: '13001',
    country: 'France',
    avg_rating: 4.7,
    total_reviews: 156,
    verified: true,
    logo_url: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400',
  }
];

const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Ways to Reduce Food Waste at Home',
    excerpt: 'Simple tips and tricks to minimize food waste in your kitchen while saving money and helping the environment.',
    content: 'Full article content...',
    author_id: '1',
    featured_image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    published_at: '2025-01-15T10:00:00Z',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'The Rise of Conscious Eating',
    excerpt: 'How mindful food choices are shaping the future of dining and creating positive environmental impact.',
    content: 'Full article content...',
    author_id: '2',
    featured_image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    published_at: '2025-01-12T10:00:00Z',
    created_at: '2025-01-12T10:00:00Z',
  },
  {
    id: '3',
    title: 'Supporting Local Restaurants',
    excerpt: 'Why choosing local eateries makes a difference for your community and how ResQ Food helps.',
    content: 'Full article content...',
    author_id: '3',
    featured_image_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    published_at: '2025-01-10T10:00:00Z',
    created_at: '2025-01-10T10:00:00Z',
  }
];

const mockPartners: Partner[] = [
  {
    id: '1',
    name: 'FoodTech Solutions',
    logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150',
    website_url: 'https://example.com',
    description: 'Leading food technology platform'
  },
  {
    id: '2',
    name: 'Green Delivery',
    logo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150',
    website_url: 'https://example.com',
    description: 'Sustainable delivery solutions'
  },
  {
    id: '3',
    name: 'Organic Farms',
    logo_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=150',
    website_url: 'https://example.com',
    description: 'Fresh organic produce supplier'
  },
  {
    id: '4',
    name: 'Fresh Market',
    logo_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150',
    website_url: 'https://example.com',
    description: 'Local fresh food marketplace'
  },
  {
    id: '5',
    name: 'Eco Foods',
    logo_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150',
    website_url: 'https://example.com',
    description: 'Sustainable food solutions'
  },
  {
    id: '6',
    name: 'City Restaurants',
    logo_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=150',
    website_url: 'https://example.com',
    description: 'Restaurant association partner'
  }
];

const mockBannerSlides: BannerSlide[] = [
  {
    id: '1',
    title: 'Save money, save food together',
    subtitle: 'Discover amazing deals on delicious meals and help reduce food waste',
    image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta_text: 'Explore Offers',
    cta_link: '#offers',
  },
  {
    id: '2',
    title: 'Fresh ingredients daily',
    subtitle: 'Partner with us to reach more customers and grow your business',
    image_url: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=1200',
    cta_text: 'Join as Merchant',
    cta_link: '/auth',
  },
];

// API Functions
export const getActiveOffers = async (): Promise<Offer[]> => {
  if (!isSupabaseAvailable()) {
    return mockOffers;
  }

  try {
    const { data, error } = await supabase!
      .from('offers')
      .select(`
        *,
        merchant:merchants(company_name, full_address, street, city, avg_rating)
      `)
      .eq('status', 'active')
      .gt('available_until', new Date().toISOString());

    if (error) throw error;
    return data || mockOffers;
  } catch (error) {
    console.warn('Error fetching offers, using mock data:', error);
    return mockOffers;
  }
};

export const getMerchants = async (): Promise<Merchant[]> => {
  if (!isSupabaseAvailable()) {
    return mockMerchants;
  }

  try {
    const { data, error } = await supabase!
      .from('merchants')
      .select('id, company_name, full_address, street, city, postal_code, country, avg_rating, logo_url, points');

    if (error) throw error;
    return data || mockMerchants;
  } catch (error) {
    console.warn('Error fetching merchants, using mock data:', error);
    return mockMerchants;
  }
};

export const getBlogPosts = async (): Promise<BlogPost[]> => {
  if (!isSupabaseAvailable()) {
    return mockBlogPosts;
  }

  try {
    const { data, error } = await supabase!
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) throw error;
    return data || mockBlogPosts;
  } catch (error) {
    console.warn('Error fetching blog posts, using mock data:', error);
    return mockBlogPosts;
  }
};

export const getPartners = async (): Promise<Partner[]> => {
  if (!isSupabaseAvailable()) {
    return mockPartners;
  }

  try {
    const { data, error } = await supabase!
      .from('partners')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return data || mockPartners;
  } catch (error) {
    console.warn('Error fetching partners, using mock data:', error);
    return mockPartners;
  }
};

export const getBannerSlides = async (): Promise<BannerSlide[]> => {
  if (!isSupabaseAvailable()) {
    return mockBannerSlides;
  }

  try {
    const { data, error } = await supabase!
      .from('banner_slides')
      .select('*')
      .eq('active', true)
      .order('display_order');

    if (error) throw error;
    return data || mockBannerSlides;
  } catch (error) {
    console.warn('Error fetching banner slides, using mock data:', error);
    return mockBannerSlides;
  }
};

// Auth Functions
export const signUp = async (email: string, password: string, userData: any) => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Service non disponible pour le moment') };
  }

  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Service non disponible pour le moment') };
  }

  const { data, error } = await supabase!.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Service non disponible pour le moment') };
  }

  const { data, error } = await supabase!.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};

export const signInWithFacebook = async () => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Service non disponible pour le moment') };
  }

  const { data, error } = await supabase!.auth.signInWithOAuth({
    provider: 'facebook',
  });
  return { data, error };
};

export const signOut = async () => {
  if (!isSupabaseAvailable()) {
    return { error: null };
  }

  const { error } = await supabase!.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  if (!isSupabaseAvailable()) {
    return { data: null, error: new Error('Service non disponible pour le moment') };
  }

  const { data, error } = await supabase!.auth.resetPasswordForEmail(email);
  return { data, error };
};

export const updatePassword = async (newPassword: string) => {
  if (!isSupabaseAvailable()) {
    return { error: new Error('Service not available') };
  }

  const { error } = await supabase!.auth.updateUser({
    password: newPassword
  });
  return { error };
};

// Client Profile Functions
export const getClientProfile = async (userId: string) => {
  if (!isSupabaseAvailable()) {
    return null;
  }

  try {
    const { data, error } = await supabase!
      .from('clients')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.warn('Error fetching client profile:', error);
    return null;
  }
};

export const updateClientProfile = async (userId: string, profileData: any) => {
  if (!isSupabaseAvailable()) {
    throw new Error('Service not available');
  }

  const { data, error } = await supabase!
    .from('clients')
    .upsert({
      id: userId,
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadProfilePhoto = async (file: File, userId: string): Promise<string> => {
  if (!isSupabaseAvailable()) {
    throw new Error('Service not available');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random()}.${fileExt}`;
  const filePath = `profiles/${fileName}`;

  const { error: uploadError } = await supabase!.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase!.storage
    .from('avatars')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const getCurrentUser = () => {
  if (!isSupabaseAvailable()) {
    return Promise.resolve({ data: { user: null }, error: null });
  }

  return supabase!.auth.getUser();
};