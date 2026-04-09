public class Calculator {

    public static void main(String[] args) {

        int result = add(2, 3);

        // Manual testing (instead of JUnit)
        if (result == 5) {
            System.out.println("Test Passed");
        } else {
            System.out.println("Test Failed");
        }
    }

    static int add(int a, int b) {
        return a + b;
    }
}