import { $, component$, useComputed$, useSignal, useStore, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead, routeLoader$, useLocation, Link } from '@builder.io/qwik-city';
import { PokemonImage } from '~/components/pokemon/pokemon-image';
import { Modal } from '~/components/shared';
import { chatGPTResponse } from '~/helpers/get-chatgpt-response';
import { getSmallPokemons } from '~/helpers/get-small-pokemons';
import type { SmallPokemon } from '~/interfaces';



export const usePokemonList = routeLoader$<SmallPokemon[]>(async({ query, redirect, pathname }) => {

  const offset = Number( query.get('offset') ?? '0');
  if ( offset < 0 || isNaN(offset)) {
    throw redirect(301, pathname)}

    return await getSmallPokemons(offset)
})


export default component$(() => {
  

  const pokemons = usePokemonList();
  const location = useLocation();
  
  const modalVisible = useSignal(false);
  const modalPokemon = useStore({
    id: '',
    name: ''
  });

  const chatResponse = useSignal('');
  
  

  //Modal functions
  const showModal = $(( id: string, name: string ) => {
    modalPokemon.id = id;
    modalPokemon.name = name;
    modalVisible.value = true;
  })

  const closeModal = $(() => {
    modalVisible.value = false;
  })

  // const currentOffset = useComputed$<number>(() => 
  //   Number(new URLSearchParams(location.url.search).get("offset") ?? "0")
  // );

  // const prevPage = $(() => {
  //   if(currentOffset.value == 10){
  //     nav("/pokemons/list-ssr/")
  //   } else{
  //     nav(`/pokemons/list-ssr/?offset=${currentOffset.value - 10}`)
  //   }
  // })

  // const nextPage = $(() => {
  //   if(currentOffset.value == 1000) nav("/pokemons/list-ssr/");
  //   else  nav(`/pokemons/list-ssr/?offset=${currentOffset.value + 10}`);
  // })

  const currentOffset = useComputed$<number>(() => {
    // const offsetString = location.url.searchParams.get('offset');
    const offsetString = new URLSearchParams( location.url.search );
    return Number(offsetString.get('offset') || 0 );
  })



  useVisibleTask$(({ track }) =>{
    track(() => modalPokemon.name);

    chatResponse.value = "";

    if(modalPokemon.name.length > 0){
      chatGPTResponse(modalPokemon.name)
        .then( resp => chatResponse.value = resp )
    }

  })

 
    return(
        <>
        <div class="flex flex-col">
          <span class="my-5 text-5xl">Status</span>
          <span>Offset: {currentOffset}</span>
          <span >Esta cargando pagina: { location.isNavigating ? 'Si' : 'No'}</span>
          </div> 

          <div class="mt-10">
          <Link href={ `/pokemons/list-ssr/?offset=${ currentOffset.value - 10 }` }
           class="btn btn-primary mr-2">
              Anterior
            </Link>

            <Link  href={ `/pokemons/list-ssr/?offset=${ currentOffset.value + 10 }` }
          class="btn btn-primary mr-2">
            Siguiente
            </Link>
          </div>

          <div class="grid grid-cols-6 mt-5">

            {pokemons.value.map(({name, id}) => (
                <div key={name} onClick$={() => showModal(id, name)} class="m-5 flex flex-col justify-content items-center">
                  <PokemonImage id={id}/> 
                  <span class="capitalize">{name}</span>
                  </div>
              ))
            }
            
          </div>

         <Modal 
         persistent
         size='md'
         showModal={modalVisible.value} closeFn={closeModal}>
          <div q:slot='title'>{modalPokemon.name}</div>
            <div q:slot='content' class="flex flex-col justify-center items-center">
          <PokemonImage id={modalPokemon.id} />
          <span>{chatResponse.value === '' ? 'Preguntado a ChatGPT' : chatResponse}</span>
          </div>
         </Modal>

        </> 
    )
});

export const head: DocumentHead = {
    title: "SSR List",
    meta: [
      {
        name: "description",
        content: "My first app in Qwik",
      },
    ],
  };