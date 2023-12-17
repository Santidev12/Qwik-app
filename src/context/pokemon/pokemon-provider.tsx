import { Slot, component$, useContextProvider, useStore, useVisibleTask$ } from "@builder.io/qwik";
import { PokemonGameContext, PokemonGameState } from "./pokemon-game.context";
import { PokemonListContext, PokemonListState } from "./pokemon-list.context";
import { json } from "stream/consumers";

export const PokemonProvider = component$(() => {

    const pokemonGame = useStore<PokemonGameState>({
        pokemonId: 1,
        isPokemonVisible: true,
        showBackImage: false
      });
      
      
      const pokemonList = useStore<PokemonListState>({
        currentPage: 0,
        isLoading: false,
        pokemons: [],
      })
      
      useContextProvider(PokemonGameContext, pokemonGame)
      useContextProvider(PokemonListContext, pokemonList)

      useVisibleTask$(() => {
        if(localStorage.getItem('pokemon-game')){
            const {
                isPokemonVisible = true,
                pokemonId=10,
                showBackImage=false,
            } = JSON.parse(localStorage.getItem('pokemon-game')!) as PokemonGameState;

            pokemonGame.isPokemonVisible = isPokemonVisible
            pokemonGame.showBackImage = showBackImage
            pokemonGame.pokemonId = pokemonId
        }
      })

      useVisibleTask$(({ track }) => {
        track( () => [ pokemonGame.pokemonId, pokemonGame.showBackImage, pokemonGame.isPokemonVisible ])

        localStorage.setItem('pokemon-game', JSON.stringify(pokemonGame))
      })


  return <Slot />
});


