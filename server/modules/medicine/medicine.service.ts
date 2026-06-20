import { getDataSource, Medicine } from "@/server/db/data-source";
import type {
  MedicineListParams,
  PaginatedMedicines,
} from "@/modules/pharmacy/types";

function serializeMedicine(item: Medicine) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    company: item.company,
    class: item.class,
    price:
      typeof item.price === "string"
        ? parseFloat(item.price)
        : Number(item.price),
    stock: item.stock,
    imageUrl: item.imageUrl,
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : String(item.createdAt),
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : String(item.updatedAt),
  };
}

// ─── Medicine Service ───────────────────────────────────────────────────────

export class MedicineService {
  /**
   * Get paginated list of medicines with filters
   */
  static async getList(
    params: MedicineListParams,
  ): Promise<PaginatedMedicines> {
    const {
      search = "",
      class: className = "",
      company = "",
      page: pageStr = "1",
      limit: limitStr = "10",
      sort = "asc",
    } = params;

    const page = Math.max(1, parseInt(pageStr));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr)));
    const skip = (page - 1) * limit;
    const sortOrder = sort === "desc" ? "DESC" : "ASC";

    const ds = await getDataSource();
    const repo = ds.getRepository(Medicine);

    const query = repo.createQueryBuilder("medicine");

    // Search filter
    if (search) {
      query.andWhere(
        "(medicine.name ILIKE :search OR medicine.description ILIKE :search OR medicine.class ILIKE :search OR medicine.company ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    // Class filter
    if (className) {
      query.andWhere("medicine.class ILIKE :className", {
        className: `%${className}%`,
      });
    }

    // Company filter
    if (company) {
      query.andWhere("medicine.company ILIKE :company", {
        company: `%${company}%`,
      });
    }

    // Sort & pagination
    query.orderBy("medicine.price", sortOrder).skip(skip).take(limit);

    const [items, total] = await query.getManyAndCount();

    return {
      items: items.map(serializeMedicine),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get a single medicine by ID
   */
  static async getById(
    id: number,
  ): Promise<ReturnType<typeof serializeMedicine> | null> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Medicine);
    const item = await repo.findOne({ where: { id } });
    return item ? serializeMedicine(item) : null;
  }

  /**
   * Decrease stock after order
   */
  static async decreaseStock(id: number, quantity: number): Promise<void> {
    const ds = await getDataSource();
    const repo = ds.getRepository(Medicine);
    await repo.update(id, {
      stock: () => `stock - ${quantity}`,
    });
  }

  /**
   * Get unique classes for filter dropdown
   */
  static async getClasses(): Promise<string[]> {
    const ds = await getDataSource();
    const result = await ds
      .createQueryBuilder()
      .select("DISTINCT medicine.class", "class")
      .from(Medicine, "medicine")
      .where("medicine.class IS NOT NULL")
      .orderBy("medicine.class", "ASC")
      .getRawMany();

    return result.map((r) => r.class);
  }

  /**
   * Get unique companies for filter dropdown
   */
  static async getCompanies(): Promise<string[]> {
    const ds = await getDataSource();
    const result = await ds
      .createQueryBuilder()
      .select("DISTINCT medicine.company", "company")
      .from(Medicine, "medicine")
      .where("medicine.company IS NOT NULL")
      .orderBy("medicine.company", "ASC")
      .getRawMany();

    return result.map((r) => r.company);
  }
}
