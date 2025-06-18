import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      tests: {}
    };

    // Environment Variables Check
    diagnostics.tests.environment = {
      NODE_ENV: process.env.NODE_ENV,
      SUPABASE_URL_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY_EXISTS: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY_MASKED: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length - 10)}`
        : 'NOT_SET'
    };

    // Basic Supabase Connection Test
    try {
      const supabase = createClient();
      
      // Test 1: Basic Connection
      const { count, error: countError } = await supabase
        .from('materials')
        .select('*', { count: 'exact', head: true });
      
      diagnostics.tests.supabaseConnection = {
        success: !countError,
        materialsCount: count,
        error: countError?.message || null
      };

      // Test 2: Simple Select
      const { data: simpleData, error: simpleError } = await supabase
        .from('materials')
        .select('id, title, is_published')
        .limit(5);
      
      diagnostics.tests.simpleSelect = {
        success: !simpleError,
        sampleCount: simpleData?.length || 0,
        sampleData: simpleData?.map(item => ({
          id: item.id,
          title: item.title,
          is_published: item.is_published
        })) || [],
        error: simpleError?.message || null
      };

      // Test 3: Published Materials Only
      const { data: publishedData, error: publishedError } = await supabase
        .from('materials')
        .select('id, title, is_published')
        .eq('is_published', true)
        .limit(5);
      
      diagnostics.tests.publishedMaterials = {
        success: !publishedError,
        publishedCount: publishedData?.length || 0,
        publishedData: publishedData?.map(item => ({
          id: item.id,
          title: item.title,
          is_published: item.is_published
        })) || [],
        error: publishedError?.message || null
      };

    } catch (error) {
      diagnostics.tests.supabaseConnection = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Health Status
    diagnostics.status = {
      overall: diagnostics.tests.supabaseConnection?.success && 
               diagnostics.tests.environment.SUPABASE_URL_EXISTS && 
               diagnostics.tests.environment.SUPABASE_KEY_EXISTS
               ? 'HEALTHY' : 'ERROR',
      recommendations: []
    };

    if (!diagnostics.tests.environment.SUPABASE_URL_EXISTS) {
      diagnostics.status.recommendations.push('Set NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    if (!diagnostics.tests.environment.SUPABASE_KEY_EXISTS) {
      diagnostics.status.recommendations.push('Set NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }
    if (!diagnostics.tests.supabaseConnection?.success) {
      diagnostics.status.recommendations.push('Check Supabase connection and RLS policies');
    }

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      error: 'Production check failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 