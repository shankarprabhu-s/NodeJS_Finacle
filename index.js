const express = require('express');
const {
	connectDB,
	Book,
	Member,
	Transaction,
} = require('./db/collections.schema');

const app = express();

app.use(express.json());

connectDB();

// dummy route
app.get('/', (req, res) => {
	res.send('Library Management System is running!');
});

app.get('/books/available', async (req, res) => {
	try {
		const books = await Book.find({ status: 'available' });

		if (books.length === 0) {
			return res.status(404).json({ message: 'No books are available' });
		}

		return res.status(200).json(books);
	} catch (error) {
		console.error('Error fetching books:', error);
		return res.status(500).json({
			message: 'An error occurred while fetching available books',
			error: error.message,
		});
	}
});


app.get('/members', async (req, res) => {
	try {
		const members = await Member.find(); // Query all members

		if (members.length === 0) {
			return res.status(404).json({ message: 'No members are available' });
		}

		return res.status(200).json(members); // Return members if found
	} catch (error) {
		console.error('Error fetching members:', error);
		return res.status(500).json({
			message: 'An error occurred while fetching members',
			error: error.message,
		});
	}
});

app.get('/books/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const book = await Book.findOne({ ISBN: id });
		if (!book) {
			return res
				.status(404)
				.json({ message: 'No book is available with provided id' });
		}
		return res.status(200).json(book);
	} catch (error) {
		console.error('Error fetching books:', error);
		return res.status(500).json({
			message: 'An error occurred while fetching available books',
			error: error.message,
		});
	}
});



app.post('/books/issue/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { mobile, borrower, dueDate } = req.body;

		
		if (!mobile || !borrower || !dueDate) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const book = await Book.findOne({ ISBN: id });

		
		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}

		if (book.status === 'borrowed') {
			return res.status(400).json({ message: 'Book is already borrowed' });
		}

		book.status = 'borrowed';
		book.borrower = borrower;

		await book.save(); 

	
		const transaction = new Transaction({
			bookId: book._id,
			memberId: mobile, 
			transactionType: 'issue',
			transactionDate: new Date(),
		});

		await transaction.save(); 


		
		return res.status(200).json({
			message: 'Book issued successfully',
			book: book,
			dueDate: dueDate,
		});
	} catch (error) {
		console.error('Error issuing book:', error);
		return res.status(500).json({
			message: 'An error occurred while issuing the book',
			error: error.message,
		});
	}
});


app.post('/books/return/:id', async (req, res) => {
	try {
		const { id } = req.params;
		const { borrowerName, mobile } = req.body;

	
		if (!borrowerName && !mobile) {
			return res
				.status(400)
				.json({ message: 'Either borrower name or mobile number is required' });
		}

	
		const book = await Book.findOne({ ISBN: id });

		if (!book) {
			return res.status(404).json({ message: 'Book not found' });
		}

		
		if (book.status !== 'borrowed') {
			return res.status(400).json({ message: 'Book was not borrowed' });
		}

		
		book.status = 'available';
		book.borrower = null;
		await book.save();

	
		const member = await Member.findOne({ bookId: book.bookId });

		if (member) {
		
			if (borrowerName) {
				member.borrower = borrowerName; 
			}
			if (mobile) {
				member.mobile = mobile; 
			}
			await member.save(); 
		} else {
			return res
				.status(404)
				.json({ message: 'Member not found for this book' });
		}

		// Return the success response
		return res.status(200).json({
			message: 'Book returned successfully and member details updated',
			book: book,
		});
	} catch (error) {
		console.error('Error returning book:', error);
		return res.status(500).json({
			message: 'An error occurred while returning the book',
			error: error.message,
		});
	}
});

app.delete('/books/delete/:id', async (req, res) => {
	try {
		const { id } = req.params;

		// Attempt to find and delete the book by its ISBN
		const deletedBook = await Book.deleteOne({ ISBN: id });

		if (deletedBook.deletedCount === 0) {
			return res
				.status(404)
				.json({ message: 'No book found with the provided ISBN' });
		}

		return res.status(200).json({ message: 'Book deleted successfully' });
	} catch (error) {
		console.error('Error deleting book:', error);
		return res.status(500).json({
			message: 'An error occurred while deleting the book',
			error: error.message,
		});
	}
});

app.post('/members/add', async (req, res) => {
	try {
		const { name, mobile, email } = req.body;

	
		if (!name || !mobile || !email) {
			return res
				.status(400)
				.json({ message: 'All fields (name, mobile, email) are required' });
		}

		// Create a new member
		const newMember = new Member({
			name,
			mobile,
			email,
		});

		// Save the new member to the database
		await newMember.save();

		return res.status(201).json({
			message: 'New library member added successfully',
			member: newMember,
		});
	} catch (error) {
		console.error('Error adding member:', error);
		return res.status(500).json({
			message: 'An error occurred while adding the new member',
			error: error.message,
		});
	}
});


app.put('/members/update/:id', async (req, res) => {
	try {
		const { bookId:id } = req.params; 
      
		const { name, mobile } = req.body; 
		
		const member = await Member.findOne({bookId});

		if (!member) {
			return res.status(404).json({ message: 'Member not found' });
		}

	
		if (name) {
			member.name = name; 
		}

		if (mobile) {
			member.mobile = mobile; 
		}

		
		await member.save();

		return res.status(200).json({
			message: 'Member details updated successfully',
			member: member,
		});
	} catch (error) {
		console.error('Error updating member:', error);
		return res.status(500).json({
			message: 'No member foound',
			
		});
	}
});


app.delete('/members/delete/:id', async (req, res) => {
	try {
		const { id } = req.params; 

		const member = await Member.deleteOne({ bookId: id });

		if (member.deletedCount === 0) {
			return res
				.status(404)
				.json({ message: 'Member not found for the provided bookId' });
		}

		return res.status(200).json({
			message: 'Member deleted successfully',
			bookId: id,
		});
	} catch (error) {
		console.error('Error deleting member:', error);
		return res.status(500).json({
			message: 'An error occurred while deleting the member',
			error: error.message,
		});
	}
});


app.listen(5000, () => {
	console.log('Running on port 5000');
});
