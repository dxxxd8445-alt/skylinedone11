import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    console.log('Admin categories API called');
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch categories', 
        details: error.message 
      }, { status: 500 });
    }

    console.log('Fetched categories:', categories?.length || 0);

    return NextResponse.json({ 
      categories: categories || []
    });

  } catch (error) {
    console.error('Admin categories error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    
    const { name, slug, description, image_url, display_order, is_active } = await request.json();

    console.log('Creating category:', { name, slug, description, image_url, display_order, is_active });

    if (!name || !slug) {
      return NextResponse.json({ 
        error: 'Name and slug are required' 
      }, { status: 400 });
    }

    const categoryData = {
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      description: description || '',
      image_url: image_url || '',
      display_order: display_order || 0,
      is_active: is_active !== undefined ? is_active : true
    };

    const { data: category, error: createError } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating category:', createError);
      return NextResponse.json({ 
        error: 'Failed to create category', 
        details: createError.message 
      }, { status: 500 });
    }

    console.log('Successfully created category:', category.id);

    return NextResponse.json({ 
      success: true, 
      category 
    });

  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}