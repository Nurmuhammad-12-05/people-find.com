-- AddForeignKey
ALTER TABLE "saved_profiles" ADD CONSTRAINT "saved_profiles_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "search_results"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
