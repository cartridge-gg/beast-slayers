// define the interface
#[dojo::interface]
trait IActions {
    fn attack(ref world: IWorldDispatcher);
    fn mega_attack(ref world: IWorldDispatcher);
}

// dojo decorator
#[dojo::contract]
mod actions {
    use super::{IActions};
    use starknet::{ContractAddress, get_caller_address, info::{get_tx_info, get_block_info}};
    use beastslayers::models::{Game, Beast, Warrior};
    use core::poseidon::poseidon_hash_span;

    fn dojo_init(ref world: IWorldDispatcher) {
        let level = 1;
        set!(world, (Game { id: 0xfea4, current_beast: Beast { level, health: (level*level*level) + 100 } }));
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

            let damage = player.level;
            if game.current_beast.health > damage {
                game.current_beast.health -= damage;
            } else {
                game.current_beast.health = 0;
            }

            player.score += game.current_beast.level;

            if player.score > (player.level*player.level*player.level) * 5 + 50 {
                player.level += 1;
            }
 
            if game.current_beast.health <= 0 {
                game.current_beast.level += 1;
                game.current_beast.health = (game.current_beast.level*game.current_beast.level*game.current_beast.level) + 100;
            }

            set!(world, (player, game));
        }

        fn mega_attack(ref world: IWorldDispatcher) {
            let info = get_block_info();
            
            let mut game = get!(world, 0xfea4, (Game));

            let player_address = get_caller_address();
            let mut player = get!(world, player_address, (Warrior));

            if player.level == 0 {
                player.level = 1;
            }

            assert!(info.block_timestamp - player.last_mega_attack > 30, "You can only mega attack once per 30 seconds");

            let damage = player.level * 10;
            game.current_beast.health -= damage;
            player.score += game.current_beast.level * 10;

            if player.score > (player.level*player.level*player.level) * 5 + 50 {
                player.level += 1;
            }

            player.last_mega_attack = info.block_timestamp;

            if game.current_beast.health <= 0 {
                game.current_beast.level += 1;
                game.current_beast.health = (game.current_beast.level*game.current_beast.level*game.current_beast.level) + 100;
            }

            set!(world, (player, game));
        }
    }
}
