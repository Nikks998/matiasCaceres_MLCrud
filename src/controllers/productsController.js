const { readJSON, writeJSON } = require("../data");
const { existsSync, unlinkSync } = require('fs')
const fs = require('fs');
const path = require('path');

const products = readJSON('./productsDataBase.json')

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {
		const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
		const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));
		res.render('products', {
			products,
			toThousand
		})
	},

	// Detail - Detail from one product
	detail: (req, res) => {
		const product = products.find(product => product.id === +req.params.id)
		return res.render('detail', {
			...product,
			toThousand
		})
	},

	// Create - Form to create
	create: (req, res) => {
		// Do the magic
		return res.render('product-create-form')
	},

	// Create -  Method to store
	store: (req, res) => {
		const { name, price, discount, description, category } = req.body;

		let newProduct = {
			id: products[products.length - 1].id + 1,
			name: name,
			price: +price,
			discount: +discount,
			category,
			description: description.trim(),
			image: req.file ? req.file.filename : null
		}

		products.push(newProduct)

		writeJSON(products, "./productsDataBase.json");

		return res.redirect('/products')
	},

	// Update - Form to edit
	edit: (req, res) => {
		const product = products.find(product => product.id === +req.params.id)
		return res.render('product-edit-form', {
			...product,
		})
	},
	// Update - Method to update
	update: (req, res) => {

		const { name, price, discount, description, category } = req.body
		const productsModify = products.map(product => {

			if (product.id === +req.params.id) {
				product.name = name.trim();
				product.price = +price;
				product.discount = +discount;
				product.category = category;
				product.description = description.trim();
				req.file &&
					existsSync(`./public/images/products/${product.image}`) &&
					unlinkSync(`./public/images/products/${product.image}`);
				product.image = req.file ? req.file.filename : product.image;
			}

			return product
		})
		writeJSON(productsModify, "./productsDataBase.json")

		return res.redirect('/products')
	},

	// Delete - Delete one product from DB
	destroy: (req, res) => {
		// Do the magic
		const productsModify = products.filter((product) => {
			if (product.id === +req.params.id) {
				existsSync(`./public/images/products/${product.image}`) &&
					unlinkSync(`./public/images/products/${product.image}`);
			}

			return product.id !== +req.params.id; //al no cumplir con la condicional anterior retorna todos los productos que excepto el que tenga el ID que viene definida en la ruta
		});

		writeJSON(productsModify, "productsDataBase.json");// sobreescribe el json con los productos filtrados expecto el que vino por req.params.id (URL)

		return res.redirect("/products");
	}
};

module.exports = controller;