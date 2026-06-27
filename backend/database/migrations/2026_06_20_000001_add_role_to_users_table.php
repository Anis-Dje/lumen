<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        // Add role column to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('customer')->after('email');
        });

        // Seed admin user if not exists (must provide UUID explicitly)
        if (DB::table('users')->where('email', 'admin@techvault.com')->doesntExist()) {
            DB::table('users')->insert([
                'id'                => (string) Str::uuid(),
                'name'              => 'Admin',
                'email'             => 'admin@techvault.com',
                'password'          => '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
                'role'              => 'admin',
                'email_verified_at' => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        } else {
            DB::table('users')->where('email', 'admin@techvault.com')->update(['role' => 'admin']);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
