import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/session";
export async function GET(){
  const user=await currentUser();
  if(!user) return NextResponse.json([], {status:401});
  const orders=await prisma.order.findMany({where:{userId:user.id},include:{items:{include:{product:true}}},orderBy:{createdAt:"desc"}});
  return NextResponse.json(orders);
}
