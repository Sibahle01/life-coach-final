import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Simple test - get ALL recurring slots
    const allSlots = await prisma.availabilitySlot.findMany({
      where: {
        specificDate: null, // Recurring slots only
      },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
      },
    });
    
    return NextResponse.json({
      totalSlots: allSlots.length,
      slotsByDay: {
        1: allSlots.filter(s => s.dayOfWeek === 1).length,
        2: allSlots.filter(s => s.dayOfWeek === 2).length,
        3: allSlots.filter(s => s.dayOfWeek === 3).length,
        4: allSlots.filter(s => s.dayOfWeek === 4).length,
        5: allSlots.filter(s => s.dayOfWeek === 5).length,
      },
      hasFridaySlots: allSlots.filter(s => s.dayOfWeek === 5).length > 0,
    });
    
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}