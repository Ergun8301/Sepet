import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MerchantProfileData {
  user_id: string;
  email: string;
  company_name: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const profileData: MerchantProfileData = await req.json();

    console.log('Creating merchant profile for user:', user.id);
    console.log('Profile data:', profileData);

    const merchantData = {
      id: user.id,
      email: user.email || profileData.email,
      company_name: profileData.company_name,
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      street: profileData.street,
      city: profileData.city,
      postal_code: profileData.postal_code,
      country: profileData.country || 'FR',
    };

    const { data: merchant, error: insertError } = await supabase
      .from('merchants')
      .upsert(merchantData, { onConflict: 'id' })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting merchant:', insertError);
      throw insertError;
    }

    console.log('Merchant profile created successfully:', merchant);

    return new Response(
      JSON.stringify({ 
        success: true, 
        merchant,
        message: 'Merchant profile created successfully'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in create-merchant-profile:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
