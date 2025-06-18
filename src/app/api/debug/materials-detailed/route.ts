import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Basic connection
    try {
      const { count, error: countError } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });
      
      diagnostics.tests.basicConnection = {
        success: !countError,
        count,
        error: countError?.message || null
      };
    } catch (error) {
      diagnostics.tests.basicConnection = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 2: Simple select without joins
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, title, is_published, user_id, created_at')
        .limit(3);
      
      diagnostics.tests.simpleSelect = {
        success: !error,
        count: data?.length || 0,
        data,
        error: error?.message || null
      };
    } catch (error) {
      diagnostics.tests.simpleSelect = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 3: Published materials only
    try {
      const { data, error } = await supabase
        .from('materials')
        .select('id, title, is_published')
        .eq('is_published', true)
        .limit(3);
      
      diagnostics.tests.publishedMaterials = {
        success: !error,
        count: data?.length || 0,
        data,
        error: error?.message || null
      };
    } catch (error) {
      diagnostics.tests.publishedMaterials = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 4: Check profiles table access
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, display_name')
        .limit(1);
      
      diagnostics.tests.profilesAccess = {
        success: !error,
        count: data?.length || 0,
        error: error?.message || null
      };
    } catch (error) {
      diagnostics.tests.profilesAccess = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 5: Join test (the problematic part)
    try {
      const { data, error } = await supabase
        .from('materials')
        .select(`
          id,
          title,
          profiles!user_id(
            id,
            username,
            display_name
          )
        `)
        .eq('is_published', true)
        .limit(1);
      
      diagnostics.tests.joinTest = {
        success: !error,
        count: data?.length || 0,
        data,
        error: error?.message || null
      };
    } catch (error) {
      diagnostics.tests.joinTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test 6: Check table structure
    try {
      const { data, error } = await supabase
        .rpc('get_table_columns', { table_name: 'materials' });
      
      diagnostics.tests.tableStructure = {
        success: !error,
        columns: data || [],
        error: error?.message || null
      };
    } catch (error) {
      diagnostics.tests.tableStructure = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      diagnostics
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 