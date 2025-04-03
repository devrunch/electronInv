const { PrismaClient } = require('../../prisma/generated/remote');
const { Parser } = require('json2csv');
const prisma = new PrismaClient();

module.exports = {
  async getAllInventory(req, res) {
    try {
      const inventory = await prisma.inventory.findMany();
      res.json(inventory);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async createInventory(req, res) {
    let { sku, name, quantity, lowerThreshold, upperThreshold, price, directions } = req.body;
    if (!sku || !name || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Trim the SKU
    sku = sku.trim();

    const skuCheck = await prisma.inventory.findUnique({ where: { sku } });
    if (skuCheck) {
      return res.status(400).json({ error: 'SKU already exists' });
    }
    
    if (isNaN(quantity) || isNaN(lowerThreshold) || isNaN(upperThreshold)) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    quantity = parseInt(quantity);
    lowerThreshold = parseInt(lowerThreshold);
    upperThreshold = parseInt(upperThreshold);
    price = parseFloat(price);

    try {
      const newItem = await prisma.inventory.create({
        data: { sku, name, quantity, lowerThreshold, upperThreshold, price, directions },
      });

      await prisma.inventoryLog.create({
        data: {
          inventoryId: newItem.sku,
          quantity,
          type: 'CREATE',
          userId: req.user.username,
        },
      });

      res.json(newItem);
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updateInventory(req, res) {
    const { id } = req.params;
    let { name, quantity, lowerThreshold, upperThreshold, price, directions } = req.body;
    if (!quantity) {
      return res.status(400).json({ error: 'Quantity is required' });
    }

    // Trim the ID
    const trimmedId = id.trim();

    quantity = parseInt(quantity);
    lowerThreshold = parseInt(lowerThreshold);
    upperThreshold = parseInt(upperThreshold);
    price = parseFloat(price);

    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Invalid input' });
    }

    try {
      const updatedItem = await prisma.inventory.update({
        where: { sku: trimmedId },
        data: { name, quantity, lowerThreshold, upperThreshold, price, directions },
      });

      await prisma.inventoryLog.create({
        data: {
          inventoryId: updatedItem.sku,
          quantity,
          type: 'UPDATE',
          userId: req.user.username,
        },
      });

      res.json(updatedItem);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async deleteInventory(req, res) {
    const { id } = req.params;
    // Trim the ID
    const trimmedId = id.trim();

    try {
      await prisma.inventory.delete({ where: { sku: trimmedId } });
      res.json({ message: 'Item deleted successfully' });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getLowStockInventory(req, res) {
    try {
      const inventory = await prisma.inventory.findMany({
        where: {
          quantity: {
            lte: prisma.inventory.fields.lowerThreshold,
          },
        },
      });
      const fields = ['id', 'sku', 'name', 'quantity', 'lowerThreshold', 'upperThreshold', 'price', 'directions'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(inventory);

      res.header('Content-Type', 'text/csv');
      res.attachment('inventory.csv');
      res.send(csv);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async exportInventoryToCSV(req, res) {
    try {
      const inventory = await prisma.inventory.findMany();
      const fields = ['id', 'sku', 'name', 'quantity', 'lowerThreshold', 'upperThreshold', 'price', 'directions'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(inventory);

      res.header('Content-Type', 'text/csv');
      res.attachment('inventory.csv');
      res.send(csv);
    } catch (err) {
      res.status(500).json({ error: 'Server error' });
    }
  },

  async quickSearch(req, res) {
    try {
      const { q } = req.query;
      const searchTerm = q.trim().toLowerCase();
      console.log(searchTerm)
      const inventory = await prisma.inventory.findMany({
        where: {
          OR: [
            { sku: { contains: searchTerm, mode: 'insensitive' } },
            { name: { contains: searchTerm, mode: 'insensitive' } }
          ],
        },
      });
      res.status(200).json(inventory);
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Server error' });
    }
  }
}