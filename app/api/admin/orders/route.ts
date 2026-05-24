import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
export async function GET(){
  try{
    await requireAdmin();
    const orders = await prisma.order.findMany({include:{user:true,items:{include:{product:true}}},orderBy:{createdAt:"desc"}});
    return NextResponse.json(orders);
  }catch(e:any){return NextResponse.json({error:e.message},{status:401})}
}
