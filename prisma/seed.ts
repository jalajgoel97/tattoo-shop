import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const products = [
  { name:"Oni Curse Tattoo Pack", category:"Temporary Tattoos", pricePaise:34900, mrpPaise:49900, stock:45, discountPercent:10, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1590246814883-4c6d173c0b32?q=80&w=900", "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=900", "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=900"], description:"Anime-inspired temporary tattoo sheet designed like a tattoo flash card for cosplay, reels and weekend streetwear.", tags:"oni, curse, tattoo, anime, cosplay" },
  { name:"Akatsuki Cloud Chain", category:"Chains", pricePaise:79900, mrpPaise:99900, stock:20, discountPercent:0, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=900", "https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=900"], description:"Dark chain with subtle anime cloud energy for layered streetwear fits.", tags:"chain, cloud, anime, black metal" },
  { name:"Sharingan Spinner Ring", category:"Rings", pricePaise:59900, mrpPaise:79900, stock:28, discountPercent:15, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900", "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=900"], description:"Adjustable spinner ring inspired by iconic anime eye motifs.", tags:"ring, spinner, eye, anime" },
  { name:"Katana Seal Tattoo Sheet", category:"Temporary Tattoos", pricePaise:29900, mrpPaise:39900, stock:50, discountPercent:0, buyOneGetOne:true, images:["https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?q=80&w=900", "https://images.unsplash.com/photo-1603899968034-1a56ca48d172?q=80&w=900"], description:"Minimal katana and seal temporary tattoo sheet with red-and-black tattoo flash styling.", tags:"katana, seal, tattoo, anime" },
  { name:"Cursed Eye Wrist Tattoo", category:"Temporary Tattoos", pricePaise:27900, mrpPaise:34900, stock:60, discountPercent:0, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1603899968034-1a56ca48d172?q=80&w=900", "https://images.unsplash.com/photo-1590246814883-4c6d173c0b32?q=80&w=900"], description:"Small wrist tattoo set for anime fans who want subtle cursed energy styling.", tags:"wrist, eye, temporary tattoo" },
  { name:"Thunder Blade Chain", category:"Chains", pricePaise:89900, mrpPaise:109900, stock:16, discountPercent:0, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1611085583191-a3b181a88401?q=80&w=900", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=900"], description:"Statement chain with blade-inspired pendant for concert and streetwear looks.", tags:"chain, thunder, blade, pendant" },
  { name:"Manga Panel Tattoo Set", category:"Temporary Tattoos", pricePaise:39900, mrpPaise:49900, stock:38, discountPercent:0, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?q=80&w=900", "https://images.unsplash.com/photo-1590246814883-4c6d173c0b32?q=80&w=900"], description:"A mixed temporary tattoo set inspired by manga panels, speed lines and tattoo flash sheets.", tags:"manga, panel, tattoo, temporary" },
  { name:"Red Moon Ring", category:"Rings", pricePaise:69900, mrpPaise:89900, stock:22, discountPercent:0, buyOneGetOne:false, images:["https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=900", "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=900"], description:"Dark plated ring with a red moon accent for anime-inspired everyday styling.", tags:"ring, red moon, anime" }
];
function slugify(s:string){return s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"")}
async function main(){
  for(const p of products){
    const data = { name:p.name, category:p.category, pricePaise:p.pricePaise, mrpPaise:p.mrpPaise, stock:p.stock, imageUrl:p.images[0], imageUrls:JSON.stringify(p.images), description:p.description, tags:p.tags, discountPercent:p.discountPercent, buyOneGetOne:p.buyOneGetOne };
    await prisma.product.upsert({where:{slug:slugify(p.name)},update:data,create:{...data,slug:slugify(p.name)}})
  }
  await prisma.coupon.upsert({where:{code:"ANIME10"},update:{type:"PERCENT",value:10,active:true,minCartPaise:0},create:{code:"ANIME10",type:"PERCENT",value:10,active:true,minCartPaise:0}});
  await prisma.siteSetting.upsert({where:{key:"backgroundChoice"},update:{value:"manga-flash-red"},create:{key:"backgroundChoice",value:"manga-flash-red"}});
  await prisma.siteSetting.upsert({where:{key:"customBackgroundUrl"},update:{value:""},create:{key:"customBackgroundUrl",value:""}});
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    await prisma.user.upsert({ where: { email: adminEmail }, update: { role: "ADMIN", emailVerified: new Date() }, create: { email: adminEmail, role: "ADMIN", emailVerified: new Date(), name: "Store Owner" } });
    console.log(`Admin user ready: ${adminEmail}`);
  } else console.log("ADMIN_EMAIL not set. Add it to .env and run npm run seed again to create an admin.");
}
main().finally(()=>prisma.$disconnect());
