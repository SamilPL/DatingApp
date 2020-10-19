using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
    [Table("Photos")] // If we want the table in DB to be called different
    public class Photo
    {
        public int id { get; set; }

        public string Url { get; set; }

        public bool IsMain { get; set; }

        public string PublicId { get; set; }

        /* Full Reference table. We need to specify manually the relationship with
            the AppUser so when we migrate, the table will be created having
            the AppUserId nullable : false and OnDelete: ReferentialAction.Cascade */
        public AppUser AppUser { get; set; }

        public int AppUserId { get; set; }
    }
}