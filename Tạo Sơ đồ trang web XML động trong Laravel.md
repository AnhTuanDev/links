## Tạo Sơ đồ trang web XML động trong Laravel

  

Đăng **4 năm trước** bởi Ryan Dhungel

Thể loại: [**Laravel**](https://kaloraat.com/categories/laravel)

Được xem 25810 lần

Thời gian đọc ước tính: 10 phút

Vậy là bạn đã xây dựng một ứng dụng web tuyệt vời bằng cách sử dụng **laravel** . Bây giờ bạn có thể tạo **Sơ đồ trang web XML động** tốt hơn **SEO** , điều này thật tuyệt. **Google** nói rằng Sử dụng sơ đồ trang web không đảm bảo rằng tất cả các mục trong sơ đồ trang web của chúng tôi sẽ được thu thập thông tin và lập chỉ mục, vì các quy trình của Google dựa vào các thuật toán phức tạp để lập lịch thu thập thông tin. Tuy nhiên, trong hầu hết các trường hợp, trang web của chúng tôi sẽ được hưởng lợi từ việc có **sơ đồ trang web** và chúng tôi sẽ không bị phạt nếu có sơ đồ đó. Vì vậy, tại sao không tạo sơ đồ trang web bằng cách sử dụng **bộ điều khiển** , **chế độ xem** và **tuyến đường** trong **laravel** và làm cho Google, **Bing** và các **rô bốt công cụ tìm kiếm** hài lòng.

Theo **google** , Đây là một số lý do **tại sao bạn nên sử dụng sơ đồ trang web** :

-   **Trang web của bạn thực sự lớn** , nơi mà trình thu thập thông tin web của google có thể bỏ sót việc thu thập thông tin một số trang được cập nhật gần đây của bạn.
-   **Trang web của bạn có kho lưu trữ thực sự lớn** , nơi các trang không được liên kết tốt với nhau.
-   **Trang web của bạn mới và có ít liên kết bên ngoài, kết** quả là Google có thể không phát hiện ra các trang của bạn nếu không có trang web nào khác liên kết đến chúng.
-   **Trang web của bạn sử dụng nội dung đa phương tiện** , được hiển thị trong Google Tin tức hoặc sử dụng các chú thích khác tương thích với sơ đồ trang web.

## Sơ đồ trang web được làm bằng gì?

Về cơ bản nó được làm bằng cá nhân `<url>`cho mỗi trang trong trang web của bạn. Bên trong mỗi `<loc>`nó trỏ đến một **vị trí** của tệp mà nó bao gồm `<url>`của. Ngoài ra còn có các trường tùy chọn như **ngày sửa đổi cuối cùng**  `<lastmod>`, **thay đổi tần số** `<changefreq>`, **ưu tiên**   `<priority>`vv Bạn có thể đọc thêm về giao thức bản đồ của s **itemap** trên [trang chính thức](http://www.sitemaps.org/protocol.html) .

### Hãy xem sơ đồ trang web mẫu bên dưới:

```
<?xml version="1.0" encoding="UTF-8"?>

<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

   <url>

      <loc>http://www.example.com/</loc>

      <lastmod>2005-01-01</lastmod>

      <changefreq>monthly</changefreq>

      <priority>0.8</priority>

   </url>

</urlset>
```

##   
Lợi ích của việc có nhiều sơ đồ trang web

Giả sử chúng ta có các bảng cơ sở dữ liệu cho **Bài viết** , **Danh mục** , **Câu hỏi** và **Thẻ** . Chúng tôi có thể tạo **sơ đồ trang web xml** cho từng sơ đồ sẽ dễ dàng quản lý và cũng rất rõ ràng để đọc cho cả con người và **rô bốt công cụ tìm kiếm** . Sau đó, chúng tôi sẽ gộp tất cả 4 sơ đồ trang đó vào một tệp chỉ mục và gửi lên google, bing hoặc bất cứ nơi nào chúng tôi có thể vui lòng.

## Bắt đầu

Chúng tôi sẽ tạo **4 sơ đồ trang web khác nhau** cho 4 **bảng cơ sở dữ liệu** và đưa tất cả chúng vào một **chỉ mục sơ đồ trang web** . Điều kiện cần là phải có một **sơ đồ trang web**  **chỉ mục** nếu chúng ta có nhiều sơ đồ trang web. Mỗi **sơ đồ trang web** có thể chứa khoảng 50000 url.

###   
Tạo bộ điều khiển sơ đồ trang web

  
Hãy tạo **bộ điều khiển** cho **sơ đồ trang web** .

```
php artisan make:controller SitemapController
```

###   
Tạo chỉ mục sơ đồ trang web

Bây giờ **bộ điều khiển sơ đồ trang web** phải trông giống như sau:

```
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;

class SitemapController extends Controller
{
    //
}
```

Hãy tạo một **phương thức** bên trong `SitemapController`lớp sẽ **tạo ra** tất cả các sơ đồ trang xml mà chúng ta cần. Chúng tôi sẽ tạo 4 sơ đồ trang cho 4 **bảng cơ sở dữ liệu** là **Bài viết** , **Danh mục** , **Câu hỏi** và **Thẻ** . Tất cả chúng sẽ được bao gồm trong một **chỉ mục sơ đồ trang web** .

```
    public function index()
    {
      $articles = Article::all()->first();
      $categories = Category::all()->first();
      $questions = Question::all()->first();
      $tags = Tag::all()->first();

      return response()->view('sitemap.index', [
          'articles' => $articles,
          'categories' => $categories,
          'questions' => $questions,
          'tags' => $tags,
      ])->header('Content-Type', 'text/xml');
    }
```

Ở đây, chúng tôi đã trả về một **đối tượng phản hồi** cho chế độ xem và đặt `text/xml`tiêu đề để đảm bảo tiêu đề có sẵn cho chế độ xem, trước tiên chúng tôi đã bao gồm phản hồi.

> Đảm bảo rằng bạn đã gọi các mô hình trên cùng lớp của mình như thế này:

```
use App\Article;
use App\Category;
use App\Question;
use App\Tag;
```

###   
Tạo chế độ xem sơ đồ trang web

tục và tạo **thư mục** trong **laravel** ứng dụng **/ lượt xem / sơ đồ trang web** và tạo một tệp `index.blade.php.`Chúng tôi sẽ gói 4 trong số `<sitemap>`nội bộ `<sitemapindex></sitemapindex>`sử dụng `<loc>`. Đây là cách trang chỉ mục của chúng tôi phải trông như thế nào:

> Thay thế `project.app:8000`với tên trang web của bạn chẳng hạn như `[mywebsite.com](http://mywebsite.com/)`

```
<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>

<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <sitemap>
        <loc>http://project.app:8000/sitemap.xml/articles</loc>
    </sitemap>
    <sitemap>
        <loc>http://project.app:8000/sitemap.xml/categories</loc>
    </sitemap>
    <sitemap>
        <loc>http://project.app:8000/sitemap.xml/questions</loc>
    </sitemap>
    <sitemap>
        <loc>http://project.app:8000/sitemap.xml/tags</loc>
    </sitemap>

</sitemapindex>
```

###   
Tạo url động cho sơ đồ trang web

Đi qua `SitemapController`và **tạo** nhiều **phương thức** cho từng **Bảng cơ sở dữ liệu** mà chúng tôi muốn **tạo url** để đưa vào sơ đồ trang web. Ở đây tôi đã tạo các phương thức cho **bài viết** , **danh mục** , **câu hỏi** và **thẻ** .

```
   public function articles()
    {
        $articles = Article::latest()->get();
        return response()->view('sitemap.articles', [
            'articles' => $articles,
        ])->header('Content-Type', 'text/xml');
    }

    public function categories()
    {
        $categories = Category::all();
        return response()->view('sitemap.categories', [
            'categories' => $categories,
        ])->header('Content-Type', 'text/xml');
    }

    public function questions()
    {
        $questions = Question::latest()->get();
        return response()->view('sitemap.questions', [
            'questions' => $questions,
        ])->header('Content-Type', 'text/xml');
    }

    public function tags()
    {
        $tags = Tag::all();
        return response()->view('sitemap.tags', [
            'tags' => $tags,
        ])->header('Content-Type', 'text/xml');
    }
```

  
Bây giờ chúng ta đã làm khá tốt công việc với **bộ điều khiển** , hãy truy cập **tài nguyên / lượt xem / sơ đồ trang web** và **tạo lượt xem** cho từng bài viết, danh mục, câu hỏi và thẻ.

Dưới đây là cách của tôi `articles.blade.php`giống như. Tôi đã đặt của tôi `changfreq`như **hàng tuần** có thể được thay đổi thành **hàng ngày** , **hàng tháng** hoặc **hàng năm** . Bạn cũng có thể đặt `priority`trong khoảng từ **0,1** đến **1,0** . bạn có thể đọc thêm về nó trong [trang sơ đồ trang web](http://www.sitemaps.org/protocol.html) .

Xin lưu ý rằng việc đặt **mức độ ưu tiên** hoặc **thay đổi tần số** cao hay thấp chỉ được thực hiện từ phía bạn. Nó là tối đa **công cụ tìm kiếm robot** để làm điều vinh dự.

```
<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    @foreach ($articles as $article)
        <url>
            <loc>http://project.app:8000/articles/{{ $article->slug }}</loc>
            <lastmod>{{ $article->created_at->tz('UTC')->toAtomString() }}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.9</priority>
        </url>
    @endforeach
</urlset>
```

Bây giờ **lặp lại** trình **tương tự** cho **các danh mục** , **câu hỏi** và **thẻ** .

> Hãy ghi nhớ rằng `<lastmod>`,  `<changefreq>`và `<priority>`thẻ là tùy chọn. Vì vậy, hãy tránh chúng nếu bạn thích.

###   
Tạo các tuyến cho sơ đồ trang web

  
Mở ra của bạn `routes.php`tập tin và thêm các **tuyến** cho **sơ đồ trang web** .

```
Route::get('/sitemap.xml', 'SitemapController@index');
Route::get('/sitemap.xml/articles', 'SitemapController@articles');
Route::get('/sitemap.xml/categories', 'SitemapController@categories');
Route::get('/sitemap.xml/questions', 'SitemapController@questions');
Route::get('/sitemap.xml/tags', 'SitemapController@tags');
```

> Lưu ý nhanh: Nếu bạn gặp bất kỳ lỗi nào khi tải chế độ xem trang của mình, hãy đảm bảo đặt các tuyến sơ đồ trang web này đến cuối tất cả danh sách tuyến đường của bạn tại `routes.php`hoặc ngược lại. Đôi khi chúng xung đột với nhau.

  
Bây giờ chúng tôi có **bộ điều khiển** và **chế độ xem** đã sẵn sàng cho **sơ đồ trang web động** . Lý do nó **động** là vì mỗi khi bạn tạo một bài viết, danh mục, câu hỏi hoặc thẻ mới. Chúng tôi không cần thêm bất kỳ url nào vào sơ đồ trang web, Nó sẽ **tự động được đưa** vào sơ đồ trang web vì chúng tôi đang sử dụng bộ điều khiển để thực hiện công việc tuyệt vời này.

#### Ảnh chụp màn hình chỉ mục sơ đồ trang web

![sơ đồ trang web laravel xml](https://kaloraat.com/photos/1/blogs/sitemap-index.jpg)

Bạn chỉ cần gửi một url `[website.com/sitemap.xml](http://website.com/sitemap.xml)`lên google. Bạn cũng có thể đi tới **các sơ đồ trang web riêng lẻ** và tự xem danh sách các **liên kết** được tạo **động** .

#### Ảnh chụp màn hình sơ đồ trang bài viết

## ![hình ảnh sơ đồ trang web laravel xml](https://kaloraat.com/photos/1/blogs/sitemap-articles.jpg)

##   
Sự kết luận

  
Trong bài viết này, chúng tôi đã học cách sử dụng **bộ điều khiển** , chế độ xem và định tuyến và thực hiện những việc theo cách chúng tôi thường làm trong **laravel** để tạo **sơ đồ trang xml động** . Phần tốt nhất của nó là chúng tôi đã tạo các sơ đồ trang web riêng lẻ cho từng **bảng cơ sở dữ liệu** và thông báo cho các công cụ tìm kiếm về url của chúng tôi sẽ **đồng bộ hóa** động.

Tất cả điều này mà không cần sử dụng bất kỳ **gói của bên thứ ba** . Điều đó thật tuyệt! Tôi hy vọng bài viết này hữu ích cho bạn. Để lại **bình luận** bên dưới để **thảo luận** .

___

___