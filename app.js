const nova = require('novaxjs2');
const path = require('path');
const app = new nova();

// Configuration
app.setViewEngine('novax', {
    viewPath: path.join(__dirname, 'views')
});

// Enable CORS for API endpoints
app.cors({
    origins: ['*'],
    methods: 'GET,POST,PUT,DELETE',
    headers: 'Content-Type'
});

let todos = [
    { id: 1, title: 'Learn NovaX', completed: false, createdAt: new Date().toISOString() },
    { id: 2, title: 'Build a Todo App', completed: false, createdAt: new Date().toISOString() },
    { id: 3, title: 'Deploy to Heroku', completed: true, createdAt: new Date().toISOString() }
];
// API Routes
app.get('/', async () => {
    return app.render('home', {
        todos: todos,
        stats: {
            total: todos.length,
            completed: todos.filter(t => t.completed).length,
            remaining: todos.filter(t => !t.completed).length
        }
    });
});

// API Endpoints
app.get('/api/todos', async (req, res) => {
    return res.json(todos);
});

app.post('/api/todos', async (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const newTodo = {
        id: Date.now(),
        title,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.push(newTodo);
    return res.status(201).json(newTodo);
});

app.put('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    
    const todo = todos.find(t => t.id == id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    if (title !== undefined) todo.title = title;
    if (completed !== undefined) todo.completed = completed;
    return res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
    const { id } = req.params;
    const index = todos.findIndex(t => t.id == id);
    
    if (index === -1) return res.status(404).json({ error: 'Todo not found' });
    
    const [deleted] = todos.splice(index, 1);
    return res.json(deleted);
});

// HTML Routes (for traditional form submissions)
app.post('/toggle/:id', async (req, res) => {
    const id = req.params.id;
    const todo = todos.find(todo => todo.id == id);
    if (todo) {
        todo.completed = !todo.completed;
    }
    return res.redirect('/');
});

app.post('/delete/:id', async (req, res) => {
    const id = req.params.id;
    const index = todos.findIndex(todo => todo.id == id);
    if (index > -1) {
        todos.splice(index, 1);
    }
    return res.redirect('/');
});

app.post('/add', async (req, res) => {
    const title = req.body.title;
    if (title) {
        const newTodo = {
            id: Date.now(),
            title: title,
            completed: false,
            createdAt: new Date().toISOString()
        };
        todos.push(newTodo);
    }
    return res.redirect('/');
});

app.post('/edit/:id', async (req, res) => {
    const id = req.params.id;
    const title = req.body.title;
    const todo = todos.find(todo => todo.id == id);
    if (todo) {
        todo.title = title;
    }
    return res.redirect('/');
});

// Error handling
app.on(404, () => {
    return '<h1>Page Not Found</h1><p>The page you requested could not be found.</p>';
});

app.error((err, req, res) => {
    console.error(err);
    return '<h1>Server Error</h1><p>Something went wrong on our end.</p>';
});

// Start server
app.at(3000, () => {
    console.log('Server is running on http://localhost:3000');
});