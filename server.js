const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const {sequelize, Sequelize} = require('./config');
const Empregado = require('./models/Empregado');

const app = express();
const PORT = 8000;

app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
        helpers: {
            eq: function (a,b) {
                return (a == b);
            }
        }
    }
));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const departamentos = {
    1: 'Administrativo',
    2: 'Designer',
    3: 'Contabil',
    4: 'Fábrica'
};

const calcularSalarioLiquido = (salarioBruto) => {
    const inss = salarioBruto * 0.11;
    let irpf = 0;
    let calcSalario = 0;

    if (salarioBruto > 4664.68) {
        irpf += (salarioBruto - 4664.68) * 0.275;
        calcSalario = 4664.68;
    }
    if (salarioBruto > 3751.06) {
        irpf += (calcSalario - 3751.06) * 0.225;
        calcSalario = 3751.06;
    }
    if (salarioBruto > 2826.65) {
        irpf += (calcSalario - 2826.65) * 0.15;
        calcSalario = 2826.65;
    }
    if (salarioBruto > 1903.98) {
        irpf += (calcSalario - 1903.98) * 0.075;
    }

    return salarioBruto - inss - irpf;
};

// Rota para listar empregados
app.get('/', async (req, res) => {
    const empregados = await Empregado.findAll();
    const empregadosComSalarioLiquido = empregados.map(emp => ({
        ...emp.toJSON(),
        salarioLiquido: calcularSalarioLiquido(emp.salario_bruto),
        departamento: departamentos[emp.departamento]
    }));
    res.render('home', { empregados: empregadosComSalarioLiquido });
});

// Rota para criar um empregado
app.post('/empregados', async (req, res) => {
    await Empregado.create(req.body);
    res.redirect('/');
});

// Rota para editar um empregado
app.get('/empregados/edit/:id', async (req, res) => {
    const empregado = await Empregado.findByPk(req.params.id);
    res.render('edit', { empregado });
});

app.post('/empregados/edit/:id', async (req, res) => {
    await Empregado.update(req.body, { where: { id: req.params.id } });
    res.redirect('/');
});

// Rota para excluir um empregado
app.post('/empregados/delete/:id', async (req, res) => {
    await Empregado.destroy({ where: { id: req.params.id } });
    res.redirect('/');
});

// Consultar maior e menor salário
app.get('/salarios', async (req, res) => {
    const empregados = await Empregado.findAll();
    const salarios = empregados.map(emp => ({
        id: emp.id,
        nome: emp.nome,
        salarioBruto: emp.salario_bruto,
        salarioLiquido: calcularSalarioLiquido(emp.salario_bruto)
    }));
    const maiorSalario = salarios.reduce((prev, curr) => (prev.salarioBruto > curr.salarioBruto) ? prev : curr);
    const menorSalario = salarios.reduce((prev, curr) => (prev.salarioBruto < curr.salarioBruto) ? prev : curr);
    res.json({ maiorSalario, menorSalario });
});

// Pesquisar por nome
app.post('/pesquisar', async (req, res) => {
    const { nome } = req.body;
    const empregados = await Empregado.findAll({
        where: {
            nome: {
                [Sequelize.Op.like]: `%${nome}%`
            }
        }
    });
    res.render('home', { empregados });
});

// Conexão e inicialização do servidor
(async () => {
    console.log(sequelize);
    await sequelize.sync();
    app.listen(PORT, () => {
        console.log(`Servidor rodando na http://localhost:8000}`);
    });
})();
