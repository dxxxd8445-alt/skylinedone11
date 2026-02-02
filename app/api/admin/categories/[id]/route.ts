import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const body = await request.json();
    const { name, slug, description, image_url, display_order, is_active } = body;
    const categoryId = params.id;

    console.log('Updating category:', categoryId, 'with data:', body);

    // Build update data object
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (description !== undefined) updateData.description = description;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;
    
    updateData.updated_at = new Date().toISOString();

    console.log('Update data:', updateData);

    const { data: category, error: updateError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating category:', updateError);
      return NextResponse.json({ 
        error: 'Failed to update category', 
        details: updateError.message 
      }, { status: 500 });
    }

    console.log('Successfully updated category:', category);

    return NextResponse.json({ success: true, category });

  } catch (error) {
    console.error('Admin category update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    
    const categoryId = params.id;

    console.log('Deleting category:', categoryId);

    // First check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('id, name, slug')
      .eq('id', categoryId)
      .single();

    if (checkError || !existingCategory) {
      console.error('Category not found:', checkError);
      return NextResponse.json({ 
        error: 'Category not found', 
        details: checkError?.message 
      }, { status: 404 });
    }

    console.log('Found category to delete:', existingCategory);

    // Delete category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) {
      console.error('Error deleting category:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete category', 
        details: deleteError.message 
      }, { status: 500 });
    }

    console.log('Successfully deleted category:', categoryId);

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Admin category delete error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}