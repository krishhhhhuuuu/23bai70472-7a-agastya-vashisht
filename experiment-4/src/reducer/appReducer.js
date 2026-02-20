export const initialState = {
  cart: [],
  theme: "light",
};

export function appReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      return { ...state, cart: [...state.cart, action.payload] };

    case "REMOVE_ITEM":
      return {
        ...state,
        cart: state.cart.filter((_, index) => index !== action.payload),
      };

    case "CLEAR_CART":
      return { ...state, cart: [] };

    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light",
      };

    default:
      return state;
  }
}