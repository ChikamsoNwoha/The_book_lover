-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: small_wins
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `api_key_hash` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `email` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Site Admin',NULL,1,'2026-01-20 17:16:00','admin@smallwins.com','$2b$10$ahJhyHDt3NmcBic/uDbPru2TA7wUXT0lL2XU7F5I1w35Q2THLeK16');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles`
--

DROP TABLE IF EXISTS `articles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `quote` text,
  `image_url` varchar(500) DEFAULT NULL,
  `category` enum('ENTREPRENEURSHIP','FASHION') NOT NULL,
  `views` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_articles_title` (`title`),
  FULLTEXT KEY `title` (`title`,`content`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles`
--

LOCK TABLES `articles` WRITE;
/*!40000 ALTER TABLE `articles` DISABLE KEYS */;
INSERT INTO `articles` VALUES (1,'Test','Lorem ipsum dolor sit amet consectetur adipisicing elit. A, provident debitis similique veritatis praesentium reiciendis delectus amet dolorem earum dicta enim natus, perspiciatis corrupti quas sapiente necessitatibus aliquid est autem!\n      Accusantium commodi esse, et velit, laudantium maxime dicta beatae natus temporibus eaque excepturi veniam illum ab expedita facilis ex soluta aperiam. Dolorem possimus consequatur fugit fugiat optio numquam, tenetur maxime.\n      Labore accusantium architecto praesentium odio quidem dolor commodi dolores earum atque, ea tempora nostrum provident molestias modi natus, fuga quia, dignissimos autem. Quae, aspernatur saepe? Enim vitae ea error iste.\n      Vitae ipsa minima nesciunt dolorem dignissimos iure, ad ut neque quibusdam quia cupiditate, fugiat sit natus voluptatem vero aliquam asperiores assumenda nobis voluptas suscipit soluta voluptatibus ullam similique sapiente? Illo.\n      Impedit aliquam veniam animi mollitia repellendus eum id amet minima error aperiam, cum vel quas quia facere assumenda dicta. Error, tempore minima tempora similique dolor iusto eius vero quis quia?\n      Sapiente iusto in expedita architecto modi soluta magni ex impedit labore. Soluta, illum tempora maxime veritatis quam incidunt accusantium facilis cum! Doloremque nesciunt libero non rem obcaecati qui suscipit omnis.\n      Voluptate, reiciendis accusantium. Blanditiis commodi cumque molestiae. Expedita in cumque perferendis vitae veniam. Ea assumenda enim quasi sit, possimus animi quos blanditiis voluptas quas perferendis harum. Delectus doloremque atque adipisci.\n      Dolorum placeat, libero corrupti quaerat suscipit illo tenetur eius similique, ab atque debitis blanditiis vero rerum qui, quidem totam pariatur ipsam? Cum, dolores perspiciatis. Ex modi ea similique officia esse?\n      Laudantium nulla rerum tempora fuga cumque illum, debitis consequatur repellendus eos omnis facere! Nostrum animi qui consequatur amet, tempora ab laboriosam sequi similique minus? Velit dolorem repellat veniam esse modi!\n      Dignissimos, architecto corporis officiis consequatur voluptatibus itaque optio quasi quos porro fugiat excepturi similique consequuntur facere eum perspiciatis id quam mollitia illum molestiae! Doloribus voluptatum voluptas at consectetur quaerat rem?\n      Distinctio ab excepturi earum quia eveniet autem aperiam, blanditiis quis vitae architecto neque facilis est optio recusandae porro eaque rem molestiae beatae perspiciatis magnam. Vitae enim labore quis autem corrupti.\n      Possimus nulla, sed nesciunt veniam, nam deleniti cum tempora cupiditate harum dolorum iste repudiandae mollitia velit voluptatibus exercitationem adipisci beatae pariatur laborum perferendis. Quibusdam at a impedit in minus assumenda!\n      Architecto reprehenderit maiores earum quas distinctio molestiae quaerat quos numquam ad officiis placeat pariatur perspiciatis sint dolorum consequuntur sapiente qui, iste itaque tenetur illo! Officia nostrum assumenda officiis laboriosam incidunt?\n      Tempora provident inventore, dolore voluptatem odio voluptate consectetur laboriosam? Nisi tempora dolorum laudantium velit consequuntur quod dolorem quisquam asperiores laborum saepe sapiente corrupti facere quidem, fuga laboriosam quasi eos minima.\n      Repudiandae amet illo ab ea in, doloribus quaerat molestias distinctio ipsam non sed minima optio? Temporibus id qui cupiditate sint velit accusamus, quos, quaerat quisquam doloremque dignissimos facilis magnam illum.\n      Molestiae tenetur nihil consequuntur! At commodi, itaque, sapiente doloremque labore ratione qui fugit optio pariatur ipsa aspernatur adipisci iure cum! Recusandae aperiam pariatur molestiae quaerat adipisci ipsum, accusantium ut harum!\n      Debitis ipsam quidem rem aspernatur, perspiciatis earum, facere asperiores et, vero hic cum nam quo magnam neque mollitia itaque quis labore? Laudantium beatae ipsum deleniti, voluptas dicta nisi molestias error!\n      Perspiciatis at cum soluta voluptas deserunt eaque rerum aliquam excepturi. Animi natus soluta praesentium, aliquid doloribus tempore ducimus iure, reiciendis obcaecati quisquam, sequi totam harum veniam ad quidem laudantium quasi.\n      Quisquam ex optio similique fuga repellat natus cum, consequatur corporis veniam porro. Quidem sequi repellat alias soluta totam harum. Impedit numquam et distinctio ullam quas! Non necessitatibus ad earum rerum.\n      Autem libero, voluptates saepe eum dignissimos omnis quaerat asperiores minus facere eveniet doloribus, pariatur natus quis neque repudiandae sed quae. Itaque fuga expedita, reprehenderit maxime cum velit magni mollitia voluptates.\n      Reiciendis atque quia accusantium saepe perspiciatis dolores magni sint, excepturi unde ut hic earum sunt, voluptatibus consequatur tenetur quae repellendus laborum sit iusto explicabo autem eum temporibus minima cupiditate. Doloribus.\n      Nemo quod laboriosam adipisci, incidunt officiis libero nobis voluptatem. Sequi rerum, dolore eius voluptate voluptatem harum tempore ipsa quam maxime iusto porro unde iure, expedita, nemo excepturi. Ea, cumque delectus.\n      Quo, eum aliquam nisi necessitatibus hic ducimus, rem sint tempora modi minus esse laudantium molestiae doloremque? Obcaecati ad asperiores incidunt ratione beatae praesentium tempore quos error quo, tenetur animi repellat?\n      Quos labore nihil molestiae deleniti sit, et ipsam perferendis modi maiores architecto? Nostrum minus ratione repellendus error voluptate, cupiditate facere ipsa repellat? At libero accusamus fugiat, magnam minus iure eligendi.\n      Facilis asperiores error maiores veritatis dolores molestias ullam cum enim expedita. Perferendis dolore corrupti vel deleniti? Magni voluptatum consequatur atque magnam dolore, tenetur similique velit dolores! Nostrum ex ullam velit.\n      Ea quibusdam consequuntur aliquid. Excepturi aut labore provident aliquid, debitis sint nesciunt ratione neque fuga nam consequuntur voluptates facilis possimus molestiae distinctio incidunt aspernatur unde doloremque commodi nobis maxime placeat?\n      Corrupti mollitia deserunt dolorum repellat officia sint earum, ullam praesentium obcaecati iusto cumque, omnis iste ipsa blanditiis rerum id nostrum suscipit eveniet qui dolores velit, facilis hic quos reiciendis! Ipsam?\n      Perspiciatis distinctio recusandae eos hic ullam quibusdam repellat quasi fuga obcaecati ea. Ipsum doloremque, hic porro nihil, consectetur, alias blanditiis debitis perferendis provident distinctio in repellendus quisquam culpa a non!\n      Doloremque at magnam quo inventore perferendis sint molestias, expedita, quasi illo culpa, incidunt aliquid consectetur molestiae iusto alias atque eligendi esse iste repellendus quia voluptate nam consequuntur ipsum. Aliquam, ipsa?\n      Repudiandae nemo, fugit aperiam omnis possimus nobis officiis ut repellat voluptatem molestiae. Molestias deserunt nobis ipsum aperiam aut autem asperiores animi itaque. Suscipit rerum sint maxime, adipisci nisi tempore quam.\n      Harum beatae, hic nostrum commodi corporis reiciendis veritatis molestiae eius officia dicta saepe perferendis autem consequatur cupiditate neque excepturi eum sequi eos impedit, ex facere qui quis dolorem labore. Adipisci!\n      Fuga deleniti architecto eius, quo aliquam suscipit voluptas natus voluptates aut iste inventore voluptatibus ducimus quam quas recusandae ad. Accusamus molestiae illum laudantium. At quae reiciendis, fuga vero provident ipsa.\n      Excepturi quam tempore nostrum suscipit nobis, alias nulla placeat? Earum maiores ducimus vitae repellat cumque iusto? Voluptas adipisci aspernatur corrupti in sapiente, necessitatibus numquam vel perspiciatis culpa at, ex impedit.\n      Excepturi ullam quae voluptatum consequuntur debitis nisi, dolor ipsum dolore numquam omnis et dolorum reiciendis eos, soluta, magnam ad fugiat laboriosam unde ea velit quod tenetur doloremque. Assumenda, ipsam animi.\n      Pariatur maxime quis porro dolorem aperiam fugiat dolore repudiandae suscipit reiciendis voluptatem soluta alias eos delectus, doloribus tenetur quas nesciunt quae voluptas corrupti dolorum officia repellendus! Veritatis eos modi natus.\n      Eum officiis, vero distinctio corporis quod odio exercitationem similique incidunt, eligendi ab repudiandae molestias omnis reprehenderit voluptate quam eius iste alias neque eos nisi excepturi! Excepturi, saepe blanditiis. Ex, itaque!\n      Distinctio repellat eum corporis aliquam delectus quia veritatis sapiente illo accusamus, labore iusto cupiditate excepturi optio. Voluptates ad aliquid in quos expedita tempore sit aperiam voluptatem quis? Aspernatur, mollitia quaerat?\n      Ab pariatur odit quis corrupti rem et nihil id, laborum excepturi provident! Sed quaerat, unde cumque ad esse ducimus. Ea, dolore aliquid ducimus a delectus aut ipsa excepturi cum nesciunt.\n      Facilis possimus ratione hic, enim, harum eius, blanditiis dolores architecto eligendi dolor quas. Fugiat adipisci hic non, eius, neque ullam quidem temporibus omnis suscipit sequi aut saepe possimus corporis. Consectetur?\n      Magni mollitia, cupiditate reiciendis culpa optio ducimus officiis impedit possimus autem molestiae delectus perferendis! Aperiam, quisquam corrupti sit cumque nostrum quasi eum asperiores, iusto id adipisci temporibus, facilis sint inventore.\n      Aperiam inventore recusandae eaque eveniet cumque quam expedita possimus, quisquam illum eos magnam aliquid reiciendis tempora dolorem, quaerat optio? Architecto accusamus, fugit blanditiis deleniti cupiditate natus ipsam adipisci ea amet!\n      Quidem sint eligendi omnis aliquam iste, explicabo nobis velit culpa quam cupiditate, suscipit modi odio assumenda. Perferendis unde, voluptas vitae, accusantium amet mollitia voluptatibus repellat expedita assumenda numquam, molestias reprehenderit.\n      Distinctio, voluptatibus quae voluptates fuga, voluptatem aspernatur, porro unde laboriosam qui corporis et. Repellendus dolore quia ea magnam obcaecati modi fugiat veritatis dicta, sint, eos nesciunt voluptatibus quisquam ipsa nihil!\n      Minus consectetur esse praesentium sapiente voluptatibus est ullam placeat, vel pariatur possimus voluptatum culpa excepturi eius veritatis, officia minima illum natus necessitatibus aliquam mollitia ut. Iste neque veritatis expedita odio!\n      Rerum iste amet minus aut deleniti officiis tenetur nostrum omnis dignissimos maiores quam autem a dicta ea nam quibusdam quidem sapiente sit repellat, impedit eaque nihil provident esse odit. Doloribus!\n      Perspiciatis, vitae cupiditate. Maxime eos dolorum, totam animi fuga aspernatur tempore quod hic corrupti dolor ipsum voluptatibus laudantium, rem autem? Illo, maiores natus dolorem iusto possimus est nisi at adipisci?\n      Ducimus esse pariatur vero quisquam, at debitis ea, inventore deleniti perferendis veritatis saepe harum quasi dolor. Eos non odit ea. Quidem officia et porro vero recusandae similique dignissimos sit eligendi!\n      Sapiente adipisci, similique, eveniet illum culpa, est nobis consequatur consectetur dicta corrupti dignissimos ipsa laborum architecto! Molestiae deleniti, commodi sit labore minima, ab soluta harum architecto doloribus expedita fuga saepe.\n      Necessitatibus ipsa, voluptatibus recusandae, aperiam, fugiat obcaecati neque cum quas optio aliquam dolore? Eaque labore minus perferendis! Quam voluptatem, asperiores doloribus aut dolores nostrum, aliquid esse illum sunt voluptate soluta.\n      Saepe alias tenetur quibusdam dolorum id ex excepturi dicta accusantium officia quis beatae molestias recusandae animi, culpa, unde quasi soluta ipsa nemo? Aliquam blanditiis atque corporis maiores similique a veritatis?',NULL,NULL,'ENTREPRENEURSHIP',26,'2026-01-31 16:36:02'),(3,'Linda’s Thread of Change','Linda was not the loudest student in her university. She liked quiet corners, her sketchbook, and the hum of a sewing machine. She grew up in a small town. Her mother taught her how to thread a needle, cut patterns, and stitch clothes. Not for business—only to save money on tailoring.\r\n\r\n\r\nWhen she left for university, Linda carried books, clothes, and her mother’s old manual sewing machine. She thought it would be useful for mending torn seams or adjusting her own clothes. Business was the last thing on her mind.\r\n\r\nOne morning, disaster struck. She was dressing for an important class presentation when her only pair of decent trousers ripped along the seam. In a rush, she brought out the old sewing machine and repaired them neatly.\r\nWhen her roommate saw the work, she was surprised. “Linda, you fit collect money for this kind work,” she said, handing her a dress that had been torn for months. Linda fixed it quickly. By the weekend, three more friends had asked her to mend or adjust outfits. \r\n\r\n\r\nThat was the moment she realised: skills could be turned into income.\r\n\r\nShe cleared a small space in her hostel room and began taking in small orders—hemming skirts, adjusting blouses, replacing zips. The money was not much, but it paid for soap, food, and sometimes photocopies for class.\r\n\r\n\r\nThe road was not smooth. The hostel’s electricity was unreliable. Some days she stitched by candlelight. Other days, customers delayed payment or brought last-minute requests. She often skipped meals to buy fabric or threads. But she remembered her mother’s words: “If you take care of the small jobs well, the big jobs will find you.”\r\n\r\n\r\nMany people delay starting a business until they have capital, fancy tools, or a perfect location. Linda started with an old sewing machine and word-of-mouth referrals. Resources are important, but resourcefulness is priceless.\r\n\r\nWithin months, her skill improved. She began making simple ready-to-wear pieces, skirts, tops, and gowns, and selling them during weekends at campus events. She used her phone camera to take pictures in natural light, posting them on social media. Soon, orders began to arrive from outside the university. One evening, after delivering a gown to a customer, the young lady hugged her and said, “Linda, you go big one day.” That sentence stayed in Linda’s mind for years. It became her silent motivation.\r\n\r\n\r\nLinda did not pay for adverts at first. Her neat stitches, perfect fits, and polite customer service were her marketing tools. When you do great work, your customers will become your promoters.\r\n\r\nBy her second year, Linda’s small tailoring corner was known across her hostel and campus. Students brought fabrics for custom-made outfits for birthdays, dinners, and cultural events. She also began receiving urgent “overnight orders” for last-minute occasions.\r\n\r\n\r\nBut as her orders increased, so did the challenges. The biggest was time. Balancing lectures, assignments, and sewing meant she often worked late into the night. There were moments when she considered quitting to focus only on her studies.\r\n\r\nOne afternoon, while she was sewing, her friend Anita said, “Linda, you dey work too much. Why you no just sew for yourself and rest small?”\r\n\r\n\r\n Linda smiled and replied:  “Anita, this machine is more than metal and thread, it’s my way of building tomorrow.”\r\n\r\n\r\nMany people stop when things get hard because they only look at today’s problems. Entrepreneurs like Linda endure because they focus on tomorrow’s possibilities. Vision fuels persistence.\r\n\r\nShe began to organise her work better. She created a simple booking system using a notebook, listing customer names, style requests, measurements, and deadlines. This reduced missed orders and helped her plan her sewing days. She also started charging a small deposit before starting work to avoid customers disappearing without paying.\r\n\r\nBy her third year, Linda had saved enough to buy an electric sewing machine. The speed amazed her, what took hours now took minutes. She could produce more clothes, which meant more income.\r\n\r\n\r\n\r\nSocial media became her silent shop window. She posted pictures of finished outfits, sometimes modelling them herself. She also started sharing short videos showing the before-and-after transformation of old clothes. People loved it. Soon, orders began to come from outside her city.\r\n\r\n\r\nHer proudest moment was when she began training others. It started with her younger cousin, who came to visit during holidays. In two months, the girl learned enough to start sewing at home. Then Linda decided to take in two students from campus, girls who wanted to earn extra money. She taught them the basics for free.\r\n\r\n\r\nWhen you train others, you multiply your impact. Linda discovered that teaching not only helps the trainee but also sharpens the teacher’s own skills.\r\n\r\nHer little tailoring space was now too small. She rented a small shop near the university gate. With white walls, a big window for natural light, and racks of colourful fabrics, it became a place students and locals loved to visit. Customers could sit, discuss designs, and watch clothes being made.\r\n\r\n\r\nOn the day she opened the shop, she placed her mother’s old sewing machine in the corner. It was worn and slow, but she kept it as a reminder of where she began. \r\n\r\n“Never despise the days of small beginnings, they are the roots that hold up the tree of success.”\r\n\r\n\r\nLinda’s brand was not just about clothes, it was about neat work, respect for customers, and reliability. These values became her silent selling points, attracting loyal customers who trusted her.\r\n\r\nLinda’s shop quickly became more than just a tailoring space. It was a place where people came not only to order clothes but also to share ideas, learn, and find encouragement. Students dropped by after lectures to practise stitching. Local women came with fabrics and stories, sometimes staying just to watch Linda’s work. As her customer base grew, she began receiving bulk orders, uniforms for a private school, costumes for a cultural dance troupe, and matching outfits for weddings. These jobs required more planning, teamwork, and consistent supply of materials.\r\n\r\n\r\nLinda realised that as a business grows, it cannot survive on memory alone. She introduced simple systems, an order form, a receipt book, and a checklist for quality control. This prevented mistakes, kept customers happy, and allowed her assistants to work independently.\r\n\r\nHer reputation spread beyond the campus. A popular fashion blogger bought a dress from her and posted it online, calling it “a perfect blend of tradition and modern style.” That single post brought in over fifty new enquiries. “Opportunity often comes quietly, through one person who believes in your work.”\r\n\r\n\r\n\r\nIn business, lowering prices is easy, but it is not always sustainable. Linda chose to add value instead of cutting corners, which built long-term loyalty.\r\n\r\nHer training programme also expanded. She began charging a modest fee for a three-month tailoring course, which covered basics, design, and customer service. She offered flexible schedules so students could attend while working or studying. Some of her trainees went on to start their own tailoring shops.\r\n\r\n\r\nOne day, at a local market fair, she was approached by a young man who introduced himself as one of her trainee’s apprentices. He said, “Linda, your training didn’t just help my boss, it put me on a path too.” That day, she realised she was creating more than clothes, she was creating opportunities.\r\n\r\n\r\nTrue business success is measured not only in income but in the lives improved along the way. Linda’s greatest pride was seeing her trainees succeed.\r\n\r\nBy the time she graduated, Linda had a loyal team, a strong customer base, and a respected name. She decided not to seek a salaried job. Instead, she registered her business officially, expanded into ready-to-wear collections, and started supplying boutiques in nearby cities. Her old sewing machine still sat in the corner of her shop, untouched but polished. Every time a new student joined, she would point to it and say:\r\n\r\n“This is where it all began. Never underestimate what you can do with what’s in your hands today.”\r\n\r\n\r\nLinda’s journey was not just about fashion; it was about resilience, vision, and the courage to start small. She became a source of inspiration for other young entrepreneurs. At youth events, she would say, “The thread you go stitching your future is your hand. Start to sew now.”\r\n\r\n\r\nLinda’s rise from a hostel room tailor to a respected fashion entrepreneur shows that starting small is not a weakness but a strength. She proved that you can begin with limited tools—an old sewing machine—and build a thriving business through discipline, creativity, and commitment. Her success came not from rushing but from mastering her craft, keeping her word to customers, and steadily improving her systems.\r\n\r\nIn my work with entrepreneurs, I’ve seen that the principles Linda lived by separate those who survive from those who thrive. Too often, founders chase quick wins, ignoring the long game. Linda’s story is proof that patience, process, and purpose create lasting businesses. Her focus on empowering others is not just goodwill, it’s smart strategy. A brand rooted in values and shared success will always stand out in a crowded market.\r\n\r\nIn my work with entrepreneurs, I’ve seen that the principles Linda lived by separate those who survive from those who thrive. \r\n\r\n\r\nToo often, founders chase quick wins, ignoring the long game. Linda’s story is proof that patience, process, and purpose create lasting businesses. Her focus on empowering others is not just goodwill, it’s smart strategy. A brand rooted in values and shared success will always stand out in a crowded market.','“Great businesses are often stitched together with patience, persistence, and the courage to start with what you have.”','/uploads/articles/1771256787383-263707992.png','ENTREPRENEURSHIP',4,'2026-02-16 15:46:27');
/*!40000 ALTER TABLE `articles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles_backup_1770935128695`
--

DROP TABLE IF EXISTS `articles_backup_1770935128695`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles_backup_1770935128695` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `category` enum('ENTREPRENEURSHIP','FASHION') NOT NULL,
  `views` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_articles_title` (`title`),
  FULLTEXT KEY `title` (`title`,`content`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles_backup_1770935128695`
--

LOCK TABLES `articles_backup_1770935128695` WRITE;
/*!40000 ALTER TABLE `articles_backup_1770935128695` DISABLE KEYS */;
INSERT INTO `articles_backup_1770935128695` VALUES (1,'Test','Lorem ipsum dolor sit amet consectetur adipisicing elit. A, provident debitis similique veritatis praesentium reiciendis delectus amet dolorem earum dicta enim natus, perspiciatis corrupti quas sapiente necessitatibus aliquid est autem!\n      Accusantium commodi esse, et velit, laudantium maxime dicta beatae natus temporibus eaque excepturi veniam illum ab expedita facilis ex soluta aperiam. Dolorem possimus consequatur fugit fugiat optio numquam, tenetur maxime.\n      Labore accusantium architecto praesentium odio quidem dolor commodi dolores earum atque, ea tempora nostrum provident molestias modi natus, fuga quia, dignissimos autem. Quae, aspernatur saepe? Enim vitae ea error iste.\n      Vitae ipsa minima nesciunt dolorem dignissimos iure, ad ut neque quibusdam quia cupiditate, fugiat sit natus voluptatem vero aliquam asperiores assumenda nobis voluptas suscipit soluta voluptatibus ullam similique sapiente? Illo.\n      Impedit aliquam veniam animi mollitia repellendus eum id amet minima error aperiam, cum vel quas quia facere assumenda dicta. Error, tempore minima tempora similique dolor iusto eius vero quis quia?\n      Sapiente iusto in expedita architecto modi soluta magni ex impedit labore. Soluta, illum tempora maxime veritatis quam incidunt accusantium facilis cum! Doloremque nesciunt libero non rem obcaecati qui suscipit omnis.\n      Voluptate, reiciendis accusantium. Blanditiis commodi cumque molestiae. Expedita in cumque perferendis vitae veniam. Ea assumenda enim quasi sit, possimus animi quos blanditiis voluptas quas perferendis harum. Delectus doloremque atque adipisci.\n      Dolorum placeat, libero corrupti quaerat suscipit illo tenetur eius similique, ab atque debitis blanditiis vero rerum qui, quidem totam pariatur ipsam? Cum, dolores perspiciatis. Ex modi ea similique officia esse?\n      Laudantium nulla rerum tempora fuga cumque illum, debitis consequatur repellendus eos omnis facere! Nostrum animi qui consequatur amet, tempora ab laboriosam sequi similique minus? Velit dolorem repellat veniam esse modi!\n      Dignissimos, architecto corporis officiis consequatur voluptatibus itaque optio quasi quos porro fugiat excepturi similique consequuntur facere eum perspiciatis id quam mollitia illum molestiae! Doloribus voluptatum voluptas at consectetur quaerat rem?\n      Distinctio ab excepturi earum quia eveniet autem aperiam, blanditiis quis vitae architecto neque facilis est optio recusandae porro eaque rem molestiae beatae perspiciatis magnam. Vitae enim labore quis autem corrupti.\n      Possimus nulla, sed nesciunt veniam, nam deleniti cum tempora cupiditate harum dolorum iste repudiandae mollitia velit voluptatibus exercitationem adipisci beatae pariatur laborum perferendis. Quibusdam at a impedit in minus assumenda!\n      Architecto reprehenderit maiores earum quas distinctio molestiae quaerat quos numquam ad officiis placeat pariatur perspiciatis sint dolorum consequuntur sapiente qui, iste itaque tenetur illo! Officia nostrum assumenda officiis laboriosam incidunt?\n      Tempora provident inventore, dolore voluptatem odio voluptate consectetur laboriosam? Nisi tempora dolorum laudantium velit consequuntur quod dolorem quisquam asperiores laborum saepe sapiente corrupti facere quidem, fuga laboriosam quasi eos minima.\n      Repudiandae amet illo ab ea in, doloribus quaerat molestias distinctio ipsam non sed minima optio? Temporibus id qui cupiditate sint velit accusamus, quos, quaerat quisquam doloremque dignissimos facilis magnam illum.\n      Molestiae tenetur nihil consequuntur! At commodi, itaque, sapiente doloremque labore ratione qui fugit optio pariatur ipsa aspernatur adipisci iure cum! Recusandae aperiam pariatur molestiae quaerat adipisci ipsum, accusantium ut harum!\n      Debitis ipsam quidem rem aspernatur, perspiciatis earum, facere asperiores et, vero hic cum nam quo magnam neque mollitia itaque quis labore? Laudantium beatae ipsum deleniti, voluptas dicta nisi molestias error!\n      Perspiciatis at cum soluta voluptas deserunt eaque rerum aliquam excepturi. Animi natus soluta praesentium, aliquid doloribus tempore ducimus iure, reiciendis obcaecati quisquam, sequi totam harum veniam ad quidem laudantium quasi.\n      Quisquam ex optio similique fuga repellat natus cum, consequatur corporis veniam porro. Quidem sequi repellat alias soluta totam harum. Impedit numquam et distinctio ullam quas! Non necessitatibus ad earum rerum.\n      Autem libero, voluptates saepe eum dignissimos omnis quaerat asperiores minus facere eveniet doloribus, pariatur natus quis neque repudiandae sed quae. Itaque fuga expedita, reprehenderit maxime cum velit magni mollitia voluptates.\n      Reiciendis atque quia accusantium saepe perspiciatis dolores magni sint, excepturi unde ut hic earum sunt, voluptatibus consequatur tenetur quae repellendus laborum sit iusto explicabo autem eum temporibus minima cupiditate. Doloribus.\n      Nemo quod laboriosam adipisci, incidunt officiis libero nobis voluptatem. Sequi rerum, dolore eius voluptate voluptatem harum tempore ipsa quam maxime iusto porro unde iure, expedita, nemo excepturi. Ea, cumque delectus.\n      Quo, eum aliquam nisi necessitatibus hic ducimus, rem sint tempora modi minus esse laudantium molestiae doloremque? Obcaecati ad asperiores incidunt ratione beatae praesentium tempore quos error quo, tenetur animi repellat?\n      Quos labore nihil molestiae deleniti sit, et ipsam perferendis modi maiores architecto? Nostrum minus ratione repellendus error voluptate, cupiditate facere ipsa repellat? At libero accusamus fugiat, magnam minus iure eligendi.\n      Facilis asperiores error maiores veritatis dolores molestias ullam cum enim expedita. Perferendis dolore corrupti vel deleniti? Magni voluptatum consequatur atque magnam dolore, tenetur similique velit dolores! Nostrum ex ullam velit.\n      Ea quibusdam consequuntur aliquid. Excepturi aut labore provident aliquid, debitis sint nesciunt ratione neque fuga nam consequuntur voluptates facilis possimus molestiae distinctio incidunt aspernatur unde doloremque commodi nobis maxime placeat?\n      Corrupti mollitia deserunt dolorum repellat officia sint earum, ullam praesentium obcaecati iusto cumque, omnis iste ipsa blanditiis rerum id nostrum suscipit eveniet qui dolores velit, facilis hic quos reiciendis! Ipsam?\n      Perspiciatis distinctio recusandae eos hic ullam quibusdam repellat quasi fuga obcaecati ea. Ipsum doloremque, hic porro nihil, consectetur, alias blanditiis debitis perferendis provident distinctio in repellendus quisquam culpa a non!\n      Doloremque at magnam quo inventore perferendis sint molestias, expedita, quasi illo culpa, incidunt aliquid consectetur molestiae iusto alias atque eligendi esse iste repellendus quia voluptate nam consequuntur ipsum. Aliquam, ipsa?\n      Repudiandae nemo, fugit aperiam omnis possimus nobis officiis ut repellat voluptatem molestiae. Molestias deserunt nobis ipsum aperiam aut autem asperiores animi itaque. Suscipit rerum sint maxime, adipisci nisi tempore quam.\n      Harum beatae, hic nostrum commodi corporis reiciendis veritatis molestiae eius officia dicta saepe perferendis autem consequatur cupiditate neque excepturi eum sequi eos impedit, ex facere qui quis dolorem labore. Adipisci!\n      Fuga deleniti architecto eius, quo aliquam suscipit voluptas natus voluptates aut iste inventore voluptatibus ducimus quam quas recusandae ad. Accusamus molestiae illum laudantium. At quae reiciendis, fuga vero provident ipsa.\n      Excepturi quam tempore nostrum suscipit nobis, alias nulla placeat? Earum maiores ducimus vitae repellat cumque iusto? Voluptas adipisci aspernatur corrupti in sapiente, necessitatibus numquam vel perspiciatis culpa at, ex impedit.\n      Excepturi ullam quae voluptatum consequuntur debitis nisi, dolor ipsum dolore numquam omnis et dolorum reiciendis eos, soluta, magnam ad fugiat laboriosam unde ea velit quod tenetur doloremque. Assumenda, ipsam animi.\n      Pariatur maxime quis porro dolorem aperiam fugiat dolore repudiandae suscipit reiciendis voluptatem soluta alias eos delectus, doloribus tenetur quas nesciunt quae voluptas corrupti dolorum officia repellendus! Veritatis eos modi natus.\n      Eum officiis, vero distinctio corporis quod odio exercitationem similique incidunt, eligendi ab repudiandae molestias omnis reprehenderit voluptate quam eius iste alias neque eos nisi excepturi! Excepturi, saepe blanditiis. Ex, itaque!\n      Distinctio repellat eum corporis aliquam delectus quia veritatis sapiente illo accusamus, labore iusto cupiditate excepturi optio. Voluptates ad aliquid in quos expedita tempore sit aperiam voluptatem quis? Aspernatur, mollitia quaerat?\n      Ab pariatur odit quis corrupti rem et nihil id, laborum excepturi provident! Sed quaerat, unde cumque ad esse ducimus. Ea, dolore aliquid ducimus a delectus aut ipsa excepturi cum nesciunt.\n      Facilis possimus ratione hic, enim, harum eius, blanditiis dolores architecto eligendi dolor quas. Fugiat adipisci hic non, eius, neque ullam quidem temporibus omnis suscipit sequi aut saepe possimus corporis. Consectetur?\n      Magni mollitia, cupiditate reiciendis culpa optio ducimus officiis impedit possimus autem molestiae delectus perferendis! Aperiam, quisquam corrupti sit cumque nostrum quasi eum asperiores, iusto id adipisci temporibus, facilis sint inventore.\n      Aperiam inventore recusandae eaque eveniet cumque quam expedita possimus, quisquam illum eos magnam aliquid reiciendis tempora dolorem, quaerat optio? Architecto accusamus, fugit blanditiis deleniti cupiditate natus ipsam adipisci ea amet!\n      Quidem sint eligendi omnis aliquam iste, explicabo nobis velit culpa quam cupiditate, suscipit modi odio assumenda. Perferendis unde, voluptas vitae, accusantium amet mollitia voluptatibus repellat expedita assumenda numquam, molestias reprehenderit.\n      Distinctio, voluptatibus quae voluptates fuga, voluptatem aspernatur, porro unde laboriosam qui corporis et. Repellendus dolore quia ea magnam obcaecati modi fugiat veritatis dicta, sint, eos nesciunt voluptatibus quisquam ipsa nihil!\n      Minus consectetur esse praesentium sapiente voluptatibus est ullam placeat, vel pariatur possimus voluptatum culpa excepturi eius veritatis, officia minima illum natus necessitatibus aliquam mollitia ut. Iste neque veritatis expedita odio!\n      Rerum iste amet minus aut deleniti officiis tenetur nostrum omnis dignissimos maiores quam autem a dicta ea nam quibusdam quidem sapiente sit repellat, impedit eaque nihil provident esse odit. Doloribus!\n      Perspiciatis, vitae cupiditate. Maxime eos dolorum, totam animi fuga aspernatur tempore quod hic corrupti dolor ipsum voluptatibus laudantium, rem autem? Illo, maiores natus dolorem iusto possimus est nisi at adipisci?\n      Ducimus esse pariatur vero quisquam, at debitis ea, inventore deleniti perferendis veritatis saepe harum quasi dolor. Eos non odit ea. Quidem officia et porro vero recusandae similique dignissimos sit eligendi!\n      Sapiente adipisci, similique, eveniet illum culpa, est nobis consequatur consectetur dicta corrupti dignissimos ipsa laborum architecto! Molestiae deleniti, commodi sit labore minima, ab soluta harum architecto doloribus expedita fuga saepe.\n      Necessitatibus ipsa, voluptatibus recusandae, aperiam, fugiat obcaecati neque cum quas optio aliquam dolore? Eaque labore minus perferendis! Quam voluptatem, asperiores doloribus aut dolores nostrum, aliquid esse illum sunt voluptate soluta.\n      Saepe alias tenetur quibusdam dolorum id ex excepturi dicta accusantium officia quis beatae molestias recusandae animi, culpa, unde quasi soluta ipsa nemo? Aliquam blanditiis atque corporis maiores similique a veritatis?','ENTREPRENEURSHIP',22,'2026-01-31 16:36:02');
/*!40000 ALTER TABLE `articles_backup_1770935128695` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `articles_backup_20260212222502`
--

DROP TABLE IF EXISTS `articles_backup_20260212222502`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `articles_backup_20260212222502` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `content` text,
  `category` enum('ENTREPRENEURSHIP','FASHION') NOT NULL,
  `views` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_articles_title` (`title`),
  FULLTEXT KEY `title` (`title`,`content`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `articles_backup_20260212222502`
--

LOCK TABLES `articles_backup_20260212222502` WRITE;
/*!40000 ALTER TABLE `articles_backup_20260212222502` DISABLE KEYS */;
INSERT INTO `articles_backup_20260212222502` VALUES (1,'Test','Lorem ipsum dolor sit amet consectetur adipisicing elit. A, provident debitis similique veritatis praesentium reiciendis delectus amet dolorem earum dicta enim natus, perspiciatis corrupti quas sapiente necessitatibus aliquid est autem!\n      Accusantium commodi esse, et velit, laudantium maxime dicta beatae natus temporibus eaque excepturi veniam illum ab expedita facilis ex soluta aperiam. Dolorem possimus consequatur fugit fugiat optio numquam, tenetur maxime.\n      Labore accusantium architecto praesentium odio quidem dolor commodi dolores earum atque, ea tempora nostrum provident molestias modi natus, fuga quia, dignissimos autem. Quae, aspernatur saepe? Enim vitae ea error iste.\n      Vitae ipsa minima nesciunt dolorem dignissimos iure, ad ut neque quibusdam quia cupiditate, fugiat sit natus voluptatem vero aliquam asperiores assumenda nobis voluptas suscipit soluta voluptatibus ullam similique sapiente? Illo.\n      Impedit aliquam veniam animi mollitia repellendus eum id amet minima error aperiam, cum vel quas quia facere assumenda dicta. Error, tempore minima tempora similique dolor iusto eius vero quis quia?\n      Sapiente iusto in expedita architecto modi soluta magni ex impedit labore. Soluta, illum tempora maxime veritatis quam incidunt accusantium facilis cum! Doloremque nesciunt libero non rem obcaecati qui suscipit omnis.\n      Voluptate, reiciendis accusantium. Blanditiis commodi cumque molestiae. Expedita in cumque perferendis vitae veniam. Ea assumenda enim quasi sit, possimus animi quos blanditiis voluptas quas perferendis harum. Delectus doloremque atque adipisci.\n      Dolorum placeat, libero corrupti quaerat suscipit illo tenetur eius similique, ab atque debitis blanditiis vero rerum qui, quidem totam pariatur ipsam? Cum, dolores perspiciatis. Ex modi ea similique officia esse?\n      Laudantium nulla rerum tempora fuga cumque illum, debitis consequatur repellendus eos omnis facere! Nostrum animi qui consequatur amet, tempora ab laboriosam sequi similique minus? Velit dolorem repellat veniam esse modi!\n      Dignissimos, architecto corporis officiis consequatur voluptatibus itaque optio quasi quos porro fugiat excepturi similique consequuntur facere eum perspiciatis id quam mollitia illum molestiae! Doloribus voluptatum voluptas at consectetur quaerat rem?\n      Distinctio ab excepturi earum quia eveniet autem aperiam, blanditiis quis vitae architecto neque facilis est optio recusandae porro eaque rem molestiae beatae perspiciatis magnam. Vitae enim labore quis autem corrupti.\n      Possimus nulla, sed nesciunt veniam, nam deleniti cum tempora cupiditate harum dolorum iste repudiandae mollitia velit voluptatibus exercitationem adipisci beatae pariatur laborum perferendis. Quibusdam at a impedit in minus assumenda!\n      Architecto reprehenderit maiores earum quas distinctio molestiae quaerat quos numquam ad officiis placeat pariatur perspiciatis sint dolorum consequuntur sapiente qui, iste itaque tenetur illo! Officia nostrum assumenda officiis laboriosam incidunt?\n      Tempora provident inventore, dolore voluptatem odio voluptate consectetur laboriosam? Nisi tempora dolorum laudantium velit consequuntur quod dolorem quisquam asperiores laborum saepe sapiente corrupti facere quidem, fuga laboriosam quasi eos minima.\n      Repudiandae amet illo ab ea in, doloribus quaerat molestias distinctio ipsam non sed minima optio? Temporibus id qui cupiditate sint velit accusamus, quos, quaerat quisquam doloremque dignissimos facilis magnam illum.\n      Molestiae tenetur nihil consequuntur! At commodi, itaque, sapiente doloremque labore ratione qui fugit optio pariatur ipsa aspernatur adipisci iure cum! Recusandae aperiam pariatur molestiae quaerat adipisci ipsum, accusantium ut harum!\n      Debitis ipsam quidem rem aspernatur, perspiciatis earum, facere asperiores et, vero hic cum nam quo magnam neque mollitia itaque quis labore? Laudantium beatae ipsum deleniti, voluptas dicta nisi molestias error!\n      Perspiciatis at cum soluta voluptas deserunt eaque rerum aliquam excepturi. Animi natus soluta praesentium, aliquid doloribus tempore ducimus iure, reiciendis obcaecati quisquam, sequi totam harum veniam ad quidem laudantium quasi.\n      Quisquam ex optio similique fuga repellat natus cum, consequatur corporis veniam porro. Quidem sequi repellat alias soluta totam harum. Impedit numquam et distinctio ullam quas! Non necessitatibus ad earum rerum.\n      Autem libero, voluptates saepe eum dignissimos omnis quaerat asperiores minus facere eveniet doloribus, pariatur natus quis neque repudiandae sed quae. Itaque fuga expedita, reprehenderit maxime cum velit magni mollitia voluptates.\n      Reiciendis atque quia accusantium saepe perspiciatis dolores magni sint, excepturi unde ut hic earum sunt, voluptatibus consequatur tenetur quae repellendus laborum sit iusto explicabo autem eum temporibus minima cupiditate. Doloribus.\n      Nemo quod laboriosam adipisci, incidunt officiis libero nobis voluptatem. Sequi rerum, dolore eius voluptate voluptatem harum tempore ipsa quam maxime iusto porro unde iure, expedita, nemo excepturi. Ea, cumque delectus.\n      Quo, eum aliquam nisi necessitatibus hic ducimus, rem sint tempora modi minus esse laudantium molestiae doloremque? Obcaecati ad asperiores incidunt ratione beatae praesentium tempore quos error quo, tenetur animi repellat?\n      Quos labore nihil molestiae deleniti sit, et ipsam perferendis modi maiores architecto? Nostrum minus ratione repellendus error voluptate, cupiditate facere ipsa repellat? At libero accusamus fugiat, magnam minus iure eligendi.\n      Facilis asperiores error maiores veritatis dolores molestias ullam cum enim expedita. Perferendis dolore corrupti vel deleniti? Magni voluptatum consequatur atque magnam dolore, tenetur similique velit dolores! Nostrum ex ullam velit.\n      Ea quibusdam consequuntur aliquid. Excepturi aut labore provident aliquid, debitis sint nesciunt ratione neque fuga nam consequuntur voluptates facilis possimus molestiae distinctio incidunt aspernatur unde doloremque commodi nobis maxime placeat?\n      Corrupti mollitia deserunt dolorum repellat officia sint earum, ullam praesentium obcaecati iusto cumque, omnis iste ipsa blanditiis rerum id nostrum suscipit eveniet qui dolores velit, facilis hic quos reiciendis! Ipsam?\n      Perspiciatis distinctio recusandae eos hic ullam quibusdam repellat quasi fuga obcaecati ea. Ipsum doloremque, hic porro nihil, consectetur, alias blanditiis debitis perferendis provident distinctio in repellendus quisquam culpa a non!\n      Doloremque at magnam quo inventore perferendis sint molestias, expedita, quasi illo culpa, incidunt aliquid consectetur molestiae iusto alias atque eligendi esse iste repellendus quia voluptate nam consequuntur ipsum. Aliquam, ipsa?\n      Repudiandae nemo, fugit aperiam omnis possimus nobis officiis ut repellat voluptatem molestiae. Molestias deserunt nobis ipsum aperiam aut autem asperiores animi itaque. Suscipit rerum sint maxime, adipisci nisi tempore quam.\n      Harum beatae, hic nostrum commodi corporis reiciendis veritatis molestiae eius officia dicta saepe perferendis autem consequatur cupiditate neque excepturi eum sequi eos impedit, ex facere qui quis dolorem labore. Adipisci!\n      Fuga deleniti architecto eius, quo aliquam suscipit voluptas natus voluptates aut iste inventore voluptatibus ducimus quam quas recusandae ad. Accusamus molestiae illum laudantium. At quae reiciendis, fuga vero provident ipsa.\n      Excepturi quam tempore nostrum suscipit nobis, alias nulla placeat? Earum maiores ducimus vitae repellat cumque iusto? Voluptas adipisci aspernatur corrupti in sapiente, necessitatibus numquam vel perspiciatis culpa at, ex impedit.\n      Excepturi ullam quae voluptatum consequuntur debitis nisi, dolor ipsum dolore numquam omnis et dolorum reiciendis eos, soluta, magnam ad fugiat laboriosam unde ea velit quod tenetur doloremque. Assumenda, ipsam animi.\n      Pariatur maxime quis porro dolorem aperiam fugiat dolore repudiandae suscipit reiciendis voluptatem soluta alias eos delectus, doloribus tenetur quas nesciunt quae voluptas corrupti dolorum officia repellendus! Veritatis eos modi natus.\n      Eum officiis, vero distinctio corporis quod odio exercitationem similique incidunt, eligendi ab repudiandae molestias omnis reprehenderit voluptate quam eius iste alias neque eos nisi excepturi! Excepturi, saepe blanditiis. Ex, itaque!\n      Distinctio repellat eum corporis aliquam delectus quia veritatis sapiente illo accusamus, labore iusto cupiditate excepturi optio. Voluptates ad aliquid in quos expedita tempore sit aperiam voluptatem quis? Aspernatur, mollitia quaerat?\n      Ab pariatur odit quis corrupti rem et nihil id, laborum excepturi provident! Sed quaerat, unde cumque ad esse ducimus. Ea, dolore aliquid ducimus a delectus aut ipsa excepturi cum nesciunt.\n      Facilis possimus ratione hic, enim, harum eius, blanditiis dolores architecto eligendi dolor quas. Fugiat adipisci hic non, eius, neque ullam quidem temporibus omnis suscipit sequi aut saepe possimus corporis. Consectetur?\n      Magni mollitia, cupiditate reiciendis culpa optio ducimus officiis impedit possimus autem molestiae delectus perferendis! Aperiam, quisquam corrupti sit cumque nostrum quasi eum asperiores, iusto id adipisci temporibus, facilis sint inventore.\n      Aperiam inventore recusandae eaque eveniet cumque quam expedita possimus, quisquam illum eos magnam aliquid reiciendis tempora dolorem, quaerat optio? Architecto accusamus, fugit blanditiis deleniti cupiditate natus ipsam adipisci ea amet!\n      Quidem sint eligendi omnis aliquam iste, explicabo nobis velit culpa quam cupiditate, suscipit modi odio assumenda. Perferendis unde, voluptas vitae, accusantium amet mollitia voluptatibus repellat expedita assumenda numquam, molestias reprehenderit.\n      Distinctio, voluptatibus quae voluptates fuga, voluptatem aspernatur, porro unde laboriosam qui corporis et. Repellendus dolore quia ea magnam obcaecati modi fugiat veritatis dicta, sint, eos nesciunt voluptatibus quisquam ipsa nihil!\n      Minus consectetur esse praesentium sapiente voluptatibus est ullam placeat, vel pariatur possimus voluptatum culpa excepturi eius veritatis, officia minima illum natus necessitatibus aliquam mollitia ut. Iste neque veritatis expedita odio!\n      Rerum iste amet minus aut deleniti officiis tenetur nostrum omnis dignissimos maiores quam autem a dicta ea nam quibusdam quidem sapiente sit repellat, impedit eaque nihil provident esse odit. Doloribus!\n      Perspiciatis, vitae cupiditate. Maxime eos dolorum, totam animi fuga aspernatur tempore quod hic corrupti dolor ipsum voluptatibus laudantium, rem autem? Illo, maiores natus dolorem iusto possimus est nisi at adipisci?\n      Ducimus esse pariatur vero quisquam, at debitis ea, inventore deleniti perferendis veritatis saepe harum quasi dolor. Eos non odit ea. Quidem officia et porro vero recusandae similique dignissimos sit eligendi!\n      Sapiente adipisci, similique, eveniet illum culpa, est nobis consequatur consectetur dicta corrupti dignissimos ipsa laborum architecto! Molestiae deleniti, commodi sit labore minima, ab soluta harum architecto doloribus expedita fuga saepe.\n      Necessitatibus ipsa, voluptatibus recusandae, aperiam, fugiat obcaecati neque cum quas optio aliquam dolore? Eaque labore minus perferendis! Quam voluptatem, asperiores doloribus aut dolores nostrum, aliquid esse illum sunt voluptate soluta.\n      Saepe alias tenetur quibusdam dolorum id ex excepturi dicta accusantium officia quis beatae molestias recusandae animi, culpa, unde quasi soluta ipsa nemo? Aliquam blanditiis atque corporis maiores similique a veritatis?','ENTREPRENEURSHIP',22,'2026-01-31 16:36:02');
/*!40000 ALTER TABLE `articles_backup_20260212222502` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment_replies`
--

DROP TABLE IF EXISTS `comment_replies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment_replies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `admin_id` int DEFAULT NULL,
  `reply` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_comment_replies_comment` (`comment_id`),
  KEY `idx_comment_replies_admin` (`admin_id`),
  CONSTRAINT `fk_comment_replies_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_comment_replies_comment` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment_replies`
--

LOCK TABLES `comment_replies` WRITE;
/*!40000 ALTER TABLE `comment_replies` DISABLE KEYS */;
INSERT INTO `comment_replies` VALUES (1,1,1,'Seen this is a test reply','2026-02-17 08:24:04','2026-02-17 08:24:04');
/*!40000 ALTER TABLE `comment_replies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comments`
--

DROP TABLE IF EXISTS `comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `comment` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_comments_article` (`article_id`),
  CONSTRAINT `fk_comments_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comments`
--

LOCK TABLES `comments` WRITE;
/*!40000 ALTER TABLE `comments` DISABLE KEYS */;
INSERT INTO `comments` VALUES (1,1,'Chikamso','This is a test comment','2026-02-17 08:16:41');
/*!40000 ALTER TABLE `comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` int DEFAULT NULL,
  `user_ip` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `article_id` (`article_id`,`user_ip`),
  KEY `idx_likes_article` (`article_id`),
  CONSTRAINT `fk_likes_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
INSERT INTO `likes` VALUES (1,1,'::1');
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_campaigns`
--

DROP TABLE IF EXISTS `newsletter_campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_campaigns` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `trigger_type` enum('MANUAL','AUTO_ARTICLE') NOT NULL DEFAULT 'MANUAL',
  `status` enum('QUEUED','SENDING','COMPLETED','PARTIAL','FAILED') NOT NULL DEFAULT 'QUEUED',
  `subject` varchar(255) NOT NULL,
  `html_content` longtext NOT NULL,
  `article_id` int DEFAULT NULL,
  `created_by_admin_id` int DEFAULT NULL,
  `total_recipients` int NOT NULL DEFAULT '0',
  `sent_count` int NOT NULL DEFAULT '0',
  `delivered_count` int NOT NULL DEFAULT '0',
  `opened_count` int NOT NULL DEFAULT '0',
  `clicked_count` int NOT NULL DEFAULT '0',
  `failed_count` int NOT NULL DEFAULT '0',
  `bounced_count` int NOT NULL DEFAULT '0',
  `complained_count` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `started_at` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `last_event_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_newsletter_campaigns_status` (`status`),
  KEY `idx_newsletter_campaigns_trigger` (`trigger_type`),
  KEY `idx_newsletter_campaigns_article` (`article_id`),
  KEY `idx_newsletter_campaigns_created_by` (`created_by_admin_id`),
  CONSTRAINT `fk_newsletter_campaigns_admin` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admins` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_newsletter_campaigns_article` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_campaigns`
--

LOCK TABLES `newsletter_campaigns` WRITE;
/*!40000 ALTER TABLE `newsletter_campaigns` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_deliveries`
--

DROP TABLE IF EXISTS `newsletter_deliveries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_deliveries` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` bigint NOT NULL,
  `subscriber_id` int DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `unsubscribe_token` varchar(64) DEFAULT NULL,
  `status` enum('PENDING','SENT','DELIVERED','OPENED','CLICKED','FAILED','BOUNCED','COMPLAINED') NOT NULL DEFAULT 'PENDING',
  `provider_message_id` varchar(255) DEFAULT NULL,
  `provider_response_code` varchar(100) DEFAULT NULL,
  `provider_response_message` text,
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `opened_at` timestamp NULL DEFAULT NULL,
  `clicked_at` timestamp NULL DEFAULT NULL,
  `failed_at` timestamp NULL DEFAULT NULL,
  `bounced_at` timestamp NULL DEFAULT NULL,
  `complained_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_deliveries_campaign_email` (`campaign_id`,`email`),
  KEY `idx_newsletter_deliveries_status` (`status`),
  KEY `idx_newsletter_deliveries_message` (`provider_message_id`),
  KEY `idx_newsletter_deliveries_subscriber` (`subscriber_id`),
  CONSTRAINT `fk_newsletter_deliveries_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `newsletter_campaigns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_newsletter_deliveries_subscriber` FOREIGN KEY (`subscriber_id`) REFERENCES `subscribers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_deliveries`
--

LOCK TABLES `newsletter_deliveries` WRITE;
/*!40000 ALTER TABLE `newsletter_deliveries` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_deliveries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `newsletter_events`
--

DROP TABLE IF EXISTS `newsletter_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `newsletter_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `campaign_id` bigint DEFAULT NULL,
  `delivery_id` bigint DEFAULT NULL,
  `provider` varchar(50) NOT NULL DEFAULT 'resend',
  `provider_event_id` varchar(255) NOT NULL,
  `provider_message_id` varchar(255) DEFAULT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_timestamp` datetime DEFAULT NULL,
  `payload_json` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_newsletter_events_provider_event` (`provider_event_id`),
  KEY `idx_newsletter_events_campaign` (`campaign_id`),
  KEY `idx_newsletter_events_delivery` (`delivery_id`),
  KEY `idx_newsletter_events_message` (`provider_message_id`),
  CONSTRAINT `fk_newsletter_events_campaign` FOREIGN KEY (`campaign_id`) REFERENCES `newsletter_campaigns` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_newsletter_events_delivery` FOREIGN KEY (`delivery_id`) REFERENCES `newsletter_deliveries` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `newsletter_events`
--

LOCK TABLES `newsletter_events` WRITE;
/*!40000 ALTER TABLE `newsletter_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `newsletter_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscribers`
--

DROP TABLE IF EXISTS `subscribers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscribers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `subscribed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `verified` tinyint(1) DEFAULT '0',
  `verified_at` timestamp NULL DEFAULT NULL,
  `verify_token` varchar(64) DEFAULT NULL,
  `unsubscribe_token` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscribers`
--

LOCK TABLES `subscribers` WRITE;
/*!40000 ALTER TABLE `subscribers` DISABLE KEYS */;
INSERT INTO `subscribers` VALUES (1,'nwohachikamso77@gmail.com','2026-02-17 08:50:48',0,NULL,'46e1a4777bcc5671313bd7e4285b0a29d73e07fcb1a1a93f4b9298af6e3ee4ea','de8891e1dbff4f4dbff6e9a437a13596543797683cca1490bfcb80f006fccbc1');
/*!40000 ALTER TABLE `subscribers` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-19 10:58:07
