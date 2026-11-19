const illustratedMenus = {
  'Kopi Susu Seruput': '/menu/kopi-susu-seruput.svg',
  Americano: '/menu/americano.svg',
  Latte: '/menu/latte.svg',
  Cappuccino: '/menu/cappuccino.svg',
  'Es Kopi Gula Aren': '/menu/es-kopi-gula-aren.svg',
  Mocha: '/menu/mocha.svg',
  'Kopi Tubruk': '/menu/kopi-tubruk.svg',
  'Coklat Dingin': '/menu/coklat-dingin.svg',
  'Matcha Latte': '/menu/matcha-latte.svg',
  'Red Velvet Latte': '/menu/red-velvet-latte.svg',
  'Taro Latte': '/menu/taro-latte.svg',
  'Susu Madu': '/menu/susu-madu.svg',
  'Teh Tarik': '/menu/teh-tarik.svg',
  'Es Teh Lemon': '/menu/es-teh-lemon.svg',
  'Teh Melati': '/menu/teh-melati.svg',
  'Teh Leci': '/menu/teh-leci.svg',
  'Roti Bakar Coklat Keju': '/menu/roti-bakar-coklat-keju.svg',
  'Kentang Goreng': '/menu/kentang-goreng.svg',
  'Pisang Goreng Madu': '/menu/pisang-goreng-madu.svg',
  'Brownies Coklat': '/menu/brownies-coklat.svg',
};

export function getMenuIllustration(name) {
  return illustratedMenus[name] ?? '';
}
