from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def seed() -> None:
    create_all_tables()

    with session_factory() as session:
        # 1. Usuario administrador (idempotente)
        admin = session.exec(
            select(Usuario).where(Usuario.username == "admin")
        ).first()
        if not admin:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)
            session.flush()

        # 2. Categorías (idempotente, al menos 3)
        categorias_data = [
            {
                "nombre": "Hamburguesas",
                "descripcion": "Hamburguesas artesanales a la parrilla con pan brioche.",
            },
            {
                "nombre": "Pizzas",
                "descripcion": "Pizzas a la piedra con masa madre y muzzarella fresca.",
            },
            {
                "nombre": "Empanadas y Acompañamientos",
                "descripcion": "Empanadas al horno, papas fritas y entradas para compartir.",
            },
            {
                "nombre": "Bebidas y Postres",
                "descripcion": "Bebidas frías y postres caseros para completar tu pedido.",
            },
        ]

        categorias_por_nombre: dict[str, Categoria] = {}
        for cat_info in categorias_data:
            cat = session.exec(
                select(Categoria).where(Categoria.nombre == cat_info["nombre"])
            ).first()
            if not cat:
                cat = Categoria(
                    nombre=cat_info["nombre"],
                    descripcion=cat_info["descripcion"],
                    activo=True,
                )
                session.add(cat)
                session.flush()
                session.refresh(cat)
            categorias_por_nombre[cat.nombre] = cat

        # 3. Productos con stock (idempotente, al menos 8)
        productos_data = [
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Clásica Cheddar",
                "descripcion": "Medallón de carne 180g, doble cheddar, lechuga, tomate y salsa de la casa.",
                "precio_base": 8500.0,
                "imagen_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
                "stock": 25,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Doble Bacon",
                "descripcion": "Doble medallón smash, panceta crocante, cheddar fundido y cebolla caramelizada.",
                "precio_base": 10900.0,
                "imagen_url": "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=800&q=80",
                "stock": 20,
            },
            {
                "categoria": "Hamburguesas",
                "nombre": "Hamburguesa Veggie Crispy",
                "descripcion": "Medallón de garbanzos y espinaca, palta, tomate confitado y alioli.",
                "precio_base": 8900.0,
                "imagen_url": "https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80",
                "stock": 15,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Muzzarella",
                "descripcion": "Salsa de tomate casera, abundante muzzarella, orégano y aceitunas verdes.",
                "precio_base": 11500.0,
                "imagen_url": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80",
                "stock": 18,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Napolitana",
                "descripcion": "Muzzarella, rodajas de tomate fresco, ajo picado y hojas de albahaca.",
                "precio_base": 12800.0,
                "imagen_url": "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=800&q=80",
                "stock": 14,
            },
            {
                "categoria": "Pizzas",
                "nombre": "Pizza Pepperoni",
                "descripcion": "Base de tomate italiano, muzzarella y láminas de pepperoni ligeramente picante.",
                "precio_base": 13500.0,
                "imagen_url": "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80",
                "stock": 12,
            },
            {
                "categoria": "Empanadas y Acompañamientos",
                "nombre": "Papas Fritas con Cheddar y Bacon",
                "descripcion": "Porción abundante de papas bastón crocantes cubiertas con cheddar y panceta.",
                "precio_base": 5800.0,
                "imagen_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
                "stock": 30,
            },
            {
                "categoria": "Empanadas y Acompañamientos",
                "nombre": "Docena de Empanadas Surtidas",
                "descripcion": "Carne cortada a cuchillo, jamón y queso, y pollo al horno de barro.",
                "precio_base": 14400.0,
                "imagen_url": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
                "stock": 16,
            },
            {
                "categoria": "Bebidas y Postres",
                "nombre": "Limonada con Menta y Jengibre",
                "descripcion": "Vaso de 500 ml recién exprimido con hielo picado, menta fresca y jengibre.",
                "precio_base": 3200.0,
                "imagen_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
                "stock": 40,
            },
            {
                "categoria": "Bebidas y Postres",
                "nombre": "Tiramisú Artesanal",
                "descripcion": "Porción individual con mascarpone, vainillas embebidas en café y cacao amargo.",
                "precio_base": 4900.0,
                "imagen_url": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
                "stock": 12,
            },
        ]

        for prod_info in productos_data:
            existente = session.exec(
                select(Producto).where(Producto.nombre == prod_info["nombre"])
            ).first()
            if not existente:
                cat = categorias_por_nombre[prod_info["categoria"]]
                assert cat.id is not None
                session.add(
                    Producto(
                        categoria_id=cat.id,
                        nombre=prod_info["nombre"],
                        descripcion=prod_info["descripcion"],
                        precio_base=prod_info["precio_base"],
                        imagen_url=prod_info["imagen_url"],
                        stock=prod_info["stock"],
                        disponible=True,
                        activo=True,
                    )
                )

        session.commit()
    print("Seed ejecutado correctamente (admin, categorías y productos listos).")


if __name__ == "__main__":
    seed()