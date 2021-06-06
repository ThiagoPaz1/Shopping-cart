const pegarI = async () => {
  const resposta = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=$computador');
  const respostaObjeto = await resposta.json();
  const results = await respostaObjeto.results;
  return results;
};

const pegarItemPorId = async (id) => {
  const resposta = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const respostaObjeto = await resposta.json();
  return respostaObjeto;
};

let salvoCartItems = [];
let itemsPreco = [];

const somarP = (arrayOfPrices) => {
  const somar = arrayOfPrices.reduce((accumulator, currentValue) => {
    let sum = accumulator;
    sum += currentValue;
    return sum;
  }, 0);
  return parseFloat(somar.toFixed(2));
};

const mostrarPrecoVerao = () => {
  const totalPrice = document.querySelector('.total-price');
  totalPrice.innerText = somarP(itemsPreco);
};

const cartItemClickListener = (event) => {
  let cartItemsList = event.target.parentNode.children;
  cartItemsList = [...cartItemsList];
  const cartItemIndex = cartItemsList.reduce((accumulator, currentValue, index) => {
    let current = accumulator;
    if (currentValue === event.target) current = index;
    return current;
  }, 0);
  itemsPreco.splice(cartItemIndex, 1);
  salvoCartItems.splice(cartItemIndex, 1);
  localStorage.setItem('cartItems', JSON.stringify(salvoCartItems));
  mostrarPrecoVerao();
  event.target.remove();
};

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}
function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

const createCartItemElement = ({ id: sku, title: name, price: precoVenda }) => {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${precoVenda}`;
  li.addEventListener('click', (event) => { cartItemClickListener(event); });
  return li;
};

const mostrarCardItem = (item) => {
  const cardItem = createCartItemElement(item);
  const cartItems = document.querySelector('.cart__items');
  cartItems.appendChild(cardItem);
};

const removerCartItems = () => {
  const cartItems = document.querySelector('.cart__items');
  const cartItemsChildren = [...cartItems.childNodes];
  cartItemsChildren.forEach((element) => element.remove());
};

const esvaziarCartList = () => {
  const button = document.querySelector('.empty-cart');
  button.addEventListener('click', () => {
    removerCartItems();
    itemsPreco = [];
    salvoCartItems = [];
    mostrarPrecoVerao();
    localStorage.clear(); 
  });
};

const getSkuFromProductItem = (item) => item.querySelector('span.item__sku').innerText;

const itemClickListener = async (event) => {
  const item = event.target.parentNode;
  const ItemObjeto = await pegarItemPorId(getSkuFromProductItem(item));
  const { price } = ItemObjeto;
  itemsPreco.push(price);
  salvoCartItems.push(ItemObjeto);
  localStorage.setItem('cartItems', JSON.stringify(salvoCartItems));
  mostrarCardItem(ItemObjeto);
  mostrarPrecoVerao();
};

const carregandoItens = () => {
  const items = document.querySelector('.items');
  const carregando = createCustomElement('div', 'loading', 'Carregando...');
  items.before(carregando);
  return carregando;
};

const createProductItemElement = ({ id: sku, title: name, thumbnail: image }) => {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));

  const adicionarBotao = createCustomElement('button', 'item__add', 'Adicionar ao carrinho!');
  adicionarBotao.addEventListener('click', (event) => { itemClickListener(event); });
  section.appendChild(adicionarBotao);

  return section;
};

const mostrarItems = async () => {
  const carregando = carregandoItens();
  const resultado = await pegarI();
  const items = document.querySelector('.items');
  resultado.forEach((item) => {
    items.appendChild(createProductItemElement(item));
  });
  carregando.remove();
};

const restauracaoCartItems = () => {
  if (localStorage.getItem('cartItems')) {
    const cartItems = JSON.parse(localStorage.getItem('cartItems'));
    cartItems.forEach((cartItem) => {
      itemsPreco.push(cartItem.price);
      salvoCartItems.push(cartItem);
      mostrarCardItem(cartItem);
    });
    mostrarPrecoVerao();
  }
};

window.onload = async () => { 
  await mostrarItems();
  restauracaoCartItems();
  esvaziarCartList();
};
