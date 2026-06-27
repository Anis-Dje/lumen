<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('oauth_provider')->nullable()->after('role');
            $table->string('oauth_id')->nullable()->after('oauth_provider');
            $table->text('avatar_url')->nullable()->after('oauth_id');

            $table->index(['oauth_provider', 'oauth_id']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['oauth_provider', 'oauth_id']);
            $table->dropColumn(['oauth_provider', 'oauth_id', 'avatar_url']);
        });
    }
};
