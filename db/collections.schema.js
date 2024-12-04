const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
	try {
		await mongoose.connect('mongodb://localhost:27017/libraryDB', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('connected successfully');
	} catch (err) {
		console.log(err.message);
	}
};

// Schema for Books Collection
const bookSchema = new mongoose.Schema({
	title: String,
	author: String,
	ISBN: String,
	status: String, 
	borrower: String,
});

// Schema for Members Collection
const memberSchema = new mongoose.Schema({
	bookId: String, 
	borrower: String, 
	issueDate: Date, 
});

// Schema for Transactions Collection
const transactionSchema = new mongoose.Schema({
	bookId: String, 
	memberId: String, 
	transactionType: String, 
	transactionDate: Date, 
});

const Book = mongoose.model('Book', bookSchema);
const Member = mongoose.model('Member', memberSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
	connectDB,
	Book,
	Member,
	Transaction,
};
