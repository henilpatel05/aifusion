import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'fusion-count.json');

interface FusionCountData {
  count: number;
  lastUpdated: string;
}

async function ensureDataFile(): Promise<void> {
  try {
    const dataDir = path.dirname(DATA_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    try {
      await fs.access(DATA_FILE);
    } catch {
      // File doesn't exist, create it
      const initialData: FusionCountData = {
        count: 0,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
    throw error;
  }
}

async function readFusionCount(): Promise<number> {
  try {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf8');
    const fusionData: FusionCountData = JSON.parse(data);
    return fusionData.count;
  } catch (error) {
    console.error('Error reading fusion count:', error);
    return 0;
  }
}

async function incrementFusionCount(): Promise<number> {
  try {
    await ensureDataFile();
    
    // Read current count
    let currentData: FusionCountData;
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8');
      currentData = JSON.parse(data);
    } catch {
      currentData = { count: 0, lastUpdated: new Date().toISOString() };
    }
    
    // Increment and save
    const newCount = currentData.count + 1;
    const updatedData: FusionCountData = {
      count: newCount,
      lastUpdated: new Date().toISOString()
    };
    
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedData, null, 2));
    return newCount;
  } catch (error) {
    console.error('Error incrementing fusion count:', error);
    throw error;
  }
}

export async function GET() {
  try {
    const count = await readFusionCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error('GET fusion count error:', error);
    return NextResponse.json(
      { error: 'Failed to get fusion count' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const newCount = await incrementFusionCount();
    return NextResponse.json({ count: newCount });
  } catch (error) {
    console.error('POST fusion count error:', error);
    return NextResponse.json(
      { error: 'Failed to increment fusion count' },
      { status: 500 }
    );
  }
}