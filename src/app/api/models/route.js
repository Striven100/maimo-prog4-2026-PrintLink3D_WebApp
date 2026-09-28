
import { NextResponse } from 'next/server';

const rows = [
 ['pl3d-001','Soporte modular para auriculares','Accesorios','PLA',125,480,'Soporte de escritorio con base reforzada y gancho amplio.','Taller Mislej 3D'],
 ['pl3d-002','Organizador hexagonal de escritorio','Hogar','PLA',210,620,'Bandeja modular para lápices, cables y herramientas pequeñas.','Cubo Norte Prints'],
 ['pl3d-003','Maceta geométrica low-poly','Decoración','PLA',180,540,'Maceta facetada para plantas pequeñas o suculentas.','Maker Demo Lab'],
 ['pl3d-004','Miniatura guerrero enano','Miniaturas','Resina',42,260,'Figura de fantasía para juegos de rol y pintura manual.','Resina Sur Studio'],
 ['pl3d-005','Clip organizador de cables','Accesorios','PETG',18,55,'Clip flexible para ordenar cables de escritorio.','Cubo Norte Prints'],
 ['pl3d-006','Base para celular inclinada','Accesorios','PLA',75,210,'Soporte simple para celular con canal de carga.','Taller Mislej 3D'],
 ['pl3d-007','Caja paramétrica para Arduino','Electrónica','PETG',95,330,'Carcasa para prototipos electrónicos con ventilación.','Maker Demo Lab'],
 ['pl3d-008','Portafilamento de rodamiento','Impresión 3D','PETG',260,720,'Soporte de bobina con base estable.','Taller Mislej 3D'],
 ['pl3d-009','Torre de dados para rol','Juegos','PLA',320,850,'Torre decorativa para lanzar dados de mesa.','Resina Sur Studio'],
 ['pl3d-010','Pieza de calibración dimensional','Herramientas','PLA',20,70,'Modelo simple para verificar tolerancias.','Maker Demo Lab'],
 ['pl3d-011','Llaveros personalizables','Regalos','PLA',15,45,'Set de llaveros con área para nombre o logo.','Taller Mislej 3D'],
 ['pl3d-012','Soporte mural para control remoto','Hogar','PLA',55,160,'Pieza de pared para guardar controles.','Cubo Norte Prints'],
 ['pl3d-013','Repuesto de perilla estriada','Repuestos','PETG',38,120,'Perilla funcional para muebles o electrodomésticos livianos.','Taller Mislej 3D'],
 ['pl3d-014','Bisagra plástica reforzada','Repuestos','PETG',62,190,'Bisagra imprimible para cajas y prototipos.','Maker Demo Lab'],
 ['pl3d-015','Soporte para cámara web','Oficina','PLA',88,250,'Brazo fijo para ubicar una webcam sobre monitor.','Cubo Norte Prints'],
 ['pl3d-016','Organizador de brocas','Herramientas','PLA',145,390,'Base para ordenar brocas y puntas.','Taller Mislej 3D'],
 ['pl3d-017','Mini busto clásico','Arte','Resina',95,420,'Escultura decorativa para impresión fina.','Resina Sur Studio'],
 ['pl3d-018','Máscara decorativa abstracta','Arte','PLA',280,760,'Máscara mural con superficies geométricas.','Maker Demo Lab'],
 ['pl3d-019','Protector de esquina flexible','Hogar','TPU',12,50,'Protector TPU para esquinas de muebles.','Cubo Norte Prints'],
 ['pl3d-020','Dock para joystick','Gaming','PLA',145,410,'Base para apoyar joystick y ordenar cable.','Taller Mislej 3D'],
];

function pricing(weightGrams, printTimeMinutes, material){
  const gramPrice = material === 'Resina' ? 500 : material === 'TPU' ? 420 : material === 'PETG' ? 320 : 250;
  const hourPrice = material === 'Resina' ? 950 : 700;
  const materialCost = weightGrams * gramPrice;
  const timeCost = Math.round((printTimeMinutes / 60) * hourPrice);
  const creatorSubtotal = materialCost + timeCost + 1200;
  const platformFeePercent = 12;
  const platformFee = Math.round(creatorSubtotal * .12);
  return { gramPrice, hourPrice, platformFeePercent, materialCost, timeCost, creatorSubtotal, platformFee, finalPrice: creatorSubtotal + platformFee };
}

export const models = rows.map(([id,name,category,material,weightGrams,printTimeMinutes,description,author]) => ({
  id,name,category,material,weightGrams,printTimeMinutes,description,author,
  license: id.endsWith('3') ? 'Uso comercial permitido' : id.endsWith('4') ? 'Atribución requerida' : 'Creative Commons',
  tags: [category, material, name.split(' ')[0]],
  pricing: pricing(weightGrams, printTimeMinutes, material)
}));

export async function GET(request){
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').toLowerCase();
  const category = searchParams.get('category') || '';
  const material = searchParams.get('material') || '';
  let filtered = models;
  if(q) filtered = filtered.filter(m => `${m.name} ${m.description} ${m.category} ${m.material} ${m.author}`.toLowerCase().includes(q));
  if(category) filtered = filtered.filter(m => m.category === category);
  if(material) filtered = filtered.filter(m => m.material === material);
  return NextResponse.json({ ok:true, source:'PrintLink 3D Local API', count:filtered.length, models:filtered });
}
