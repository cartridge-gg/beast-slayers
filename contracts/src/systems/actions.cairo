// define the interface
#[dojo::interface]
trait IActions {
    fn attack(ref world: IWorldDispatcher);
    fn claim_tokens(ref world: IWorldDispatcher);
}

// dojo decorator
#[dojo::contract]
mod actions {
    use super::{IActions};
    use starknet::{ContractAddress, get_caller_address, info::{get_tx_info, get_block_info}};
    use beastslayers::models::{Game, Beast, Warrior};
    use core::poseidon::poseidon_hash_span;
    use beastslayers::tokens::thing::{IThing, IThingDispatcher, IThingDispatcherTrait};

    fn dojo_init(ref world: IWorldDispatcher) {
        let level = 1;
        set!(world, (Game { id: 0xfea4, current_beast: Beast { level, health: (level*level*level) + 100 } }));
    }

    fn thing(world: IWorldDispatcher) -> IThingDispatcher {
        let (class_hash, contract_address) =
            match world.resource(selector_from_tag!("beastslayers-Thing")) {
            dojo::world::Resource::Contract((
                class_hash, contract_address
            )) => (class_hash, contract_address),
            _ => (0.try_into().unwrap(), 0.try_into().unwrap())
        };

        if class_hash.is_zero() || contract_address.is_zero() {
            panic!("Invalid resource!");
        }

        IThingDispatcher { contract_address }
    }


    #[abi(embed_v0)]
    impl ActionsImpl of IActions<ContractState> {
        fn attack(ref world: IWorldDispatcher) {
            let mut game = get!(world, 0xfea4, (Game));
            let player_address = get_caller_address();
            let mut player = get!(world, player_address, (Warrior));

            if player.level == 0 {
                player.level = 1;
            }

            let mut damage = player.level;
            if game.current_beast.health > damage {
                game.current_beast.health -= damage;
            } else {
                damage = game.current_beast.health;
                game.current_beast.health = 0;
            }

            // Calculate tokens to award based on damage dealt
            // 1 THING * BEAST_LEVEL
            let total_tokens: u256 = 1000000000000000000 * game.current_beast.level.into();
            // distributed amongst attackers
            let tokens_to_award = (damage.into() * total_tokens) / game.current_beast.level.into();

            // Update unclaimed tokens
            player.unclaimed_tokens += tokens_to_award;

            player.score += damage;

            if player.score > ((player.level*player.level*player.level) * 5 + 50) {
                player.level += 1;
            }
 
            if game.current_beast.health <= 0 {
                game.current_beast.level += 1;
                game.current_beast.health = (game.current_beast.level*game.current_beast.level*game.current_beast.level) + 100;
            }

            println!("player.unclaimed_tokens: {}", player.unclaimed_tokens);
            println!("player.score: {}", player.score);
            println!("player.level: {}", player.level);
            println!("game.current_beast.level: {}", game.current_beast.level);
            println!("game.current_beast.health: {}", game.current_beast.health);
            println!("damage: {}", damage);

            set!(world, (player, game));
        }

        fn claim_tokens(ref world: IWorldDispatcher) {
            let thing = thing(world);
            let player_address = get_caller_address();
            let mut player = get!(world, player_address, (Warrior));

            assert!(player.unclaimed_tokens > 0, "No tokens to claim");

            thing.mint_from(player_address, player.unclaimed_tokens);
            player.unclaimed_tokens = 0;

            set!(world, (player));
        }
    }
}
