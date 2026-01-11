<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Cancha;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CanchaSeeder::class,
        ]);
        
        // User::factory(10)->create();
        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );
    }
}
