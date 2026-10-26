export default class BaseRepository {
  constructor(model) {
    this.model = model
  }

  async findAll(options = {}) {
    return await this.model.findMany(options)
  }

  async findOne(options = {}) {
    return await this.model.findFirst(options)
  }

  async findUnique(options = {}) {
    return await this.model.findUnique(options)
  }

  async create(data) {
    return await this.model.create({
      data,
    })
  }

  async update(where, data) {
    return await this.model.update({
      where,
      data,
    })
  }

  async delete(where) {
    return await this.model.delete({
      where,
    })
  }

  async count(where = {}) {
    return await this.model.count({
      where,
    })
  }

  async paginate({
    where = {},
    include = {},
    skip = 0,
    take = 10,
    orderBy = {},
  }) {
    const [items, total] = await Promise.all([
      this.model.findMany({
        where,
        include,
        skip,
        take,
        orderBy,
      }),
      this.model.count({
        where,
      }),
    ])

    return {
      items,
      total,
    }
  }
}
