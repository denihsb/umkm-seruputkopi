const illustratedMenus = {
  'Kopi Susu Seruput': '/menu/kopi-susu-seruput.jpg',
  Americano: '/menu/americano.jpg',
  Latte: '/menu/latte.jpg',
  'Cafe Latte': '/menu/cafe-latte.jpg',
  Cappuccino: '/menu/cappuccino.jpg',
  'Es Kopi Gula Aren': '/menu/es-kopi-gula-aren.jpg',
  'Kopi Susu Gula Aren': '/menu/kopi-susu-gula-aren.jpg',
  Mocha: '/menu/mocha.jpg',
  'Kopi Tubruk': '/menu/kopi-tubruk.jpg',
  'Coklat Dingin': '/menu/coklat-dingin.jpg',
  'Matcha Latte': '/menu/matcha-latte.jpg',
  'Red Velvet Latte': '/menu/red-velvet-latte.jpg',
  'Taro Latte': '/menu/taro-latte.jpg',
  'Susu Madu': '/menu/susu-madu.jpg',
  'Teh Tarik': '/menu/teh-tarik.jpg',
  'Es Teh': '/menu/es-teh.jpg',
  'Es Teh Lemon': '/menu/es-teh-lemon.jpg',
  'Teh Melati': '/menu/teh-melati.jpg',
  'Teh Leci': '/menu/teh-leci.jpg',
  'Roti Bakar Coklat Keju': '/menu/roti-bakar-coklat-keju.jpg',
  'Kentang Goreng': '/menu/kentang-goreng.jpg',
  'Pisang Goreng Madu': '/menu/pisang-goreng-madu.jpg',
  'Brownies Coklat': '/menu/brownies-coklat.jpg',
};

export function getMenuIllustration(name) {
  return illustratedMenus[name] ?? '';
}
