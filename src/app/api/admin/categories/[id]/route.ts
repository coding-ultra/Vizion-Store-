import {NextRequest,NextResponse} from "next/server";
import {getCurrentUser} from "@/lib/auth";
import {supabaseAdmin} from "@/lib/supabase-admin";
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 if((await getCurrentUser())?.role!=="admin")return NextResponse.json({error:"Forbidden"},{status:403});
 const {id}=await params;
 try{const {name,slug,description}=await req.json();if(typeof name!=="string"||name.trim().length<2||name.trim().length>80||typeof slug!=="string"||slug.length>100||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||typeof description!=="string"||description.length>500)return NextResponse.json({error:"Enter a valid name, slug and description."},{status:400});const {error}=await supabaseAdmin.from("categories").update({name:name.trim(),slug,description:description.trim()||null}).eq("id",id);if(error)return NextResponse.json({error:error.code==="23505"?"That category slug is already in use.":"Could not update category."},{status:400});return NextResponse.json({success:true});}catch{return NextResponse.json({error:"Invalid request."},{status:400});}
}
export async function DELETE(_r:Request,{params}:{params:Promise<{id:string}>}){if((await getCurrentUser())?.role!=="admin")return NextResponse.json({error:"Forbidden"},{status:403});const {id}=await params;const {error}=await supabaseAdmin.from("categories").delete().eq("id",id);if(error)return NextResponse.json({error:"Could not delete category."},{status:400});return NextResponse.json({success:true});}
