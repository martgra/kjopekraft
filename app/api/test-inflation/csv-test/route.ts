import { NextResponse } from 'next/server';
import { testCsvParsing } from '../test-csv';

export async function GET() {
  try {
    // Test CSV parsing with sample data
    const result = await testCsvParsing();
    
    // Return the parsed data as JSON
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in CSV parsing test route:', error);
    return NextResponse.json({ 
      error: 'CSV parsing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
